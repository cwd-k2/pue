import type { Plugin, ViteDevServer } from 'vite'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { PueOptions } from './types'
import { extract, writePursFile, scanAndExtract } from './extract'
import { compileSync, compileAsync } from './compile'
import { remapErrors, formatError } from './errors'
import { getExportsFromExterns } from './externs'
import { transformSFC, getExportsFromJS } from './transform'

const PURS_LANG_RE =
  /<script\b(?=[^>]*\blang=["']purs["'])[^>]*>/

export function pue(options: PueOptions = {}): Plugin {
  const outputDir = options.outputDir ?? 'output'
  const srcDirs = options.srcDirs ?? ['src']
  const pursCommand = options.pursCommand ?? 'spago build'
  const debug = options.debug ?? false
  const modulePrefix = options.modulePrefix ?? 'Pue'

  let root: string
  let server: ViteDevServer | undefined
  const moduleMap = new Map<string, string>()

  function log(msg: string) {
    if (debug) console.log(`[pue] ${msg}`)
  }

  function getExports(moduleName: string): string[] {
    const fromExterns = getExportsFromExterns(path.join(root, outputDir), moduleName)
    if (fromExterns) {
      log(`exports from externs: ${moduleName} (${fromExterns.length})`)
      return fromExterns
    }
    log(`exports from JS fallback: ${moduleName}`)
    return getExportsFromJS(root, outputDir, moduleName)
  }

  // --- Spago source management ---

  function resolvePueLib(): string | null {
    const candidates = [
      path.resolve(root, 'node_modules', 'pue', 'purescript', 'src'),
      path.resolve(root, '..', 'purescript', 'src'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(c)) return c
    }
    return null
  }

  function ensureSpagoSources() {
    const dhallPath = path.join(root, 'spago.dhall')
    if (!fs.existsSync(dhallPath)) return

    const content = fs.readFileSync(dhallPath, 'utf-8')
    const toAdd: string[] = []

    if (!content.includes('.pue')) {
      toAdd.push('".pue/**/*.purs"')
    }

    const pueLib = resolvePueLib()
    if (pueLib) {
      const relPath = path.relative(root, pueLib).replace(/\\/g, '/')
      if (!content.includes(relPath)) {
        toAdd.push(`"${relPath}/**/*.purs"`)
      }
    }

    if (toAdd.length === 0) return

    const updated = content.replace(
      /,\s*sources\s*=\s*\[/,
      `, sources = [ ${toAdd.join(', ')}, `,
    )
    if (updated !== content) {
      fs.writeFileSync(dhallPath, updated)
    }
  }

  // --- Vite plugin hooks ---

  return {
    name: 'vite-plugin-pue',
    enforce: 'pre',

    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [{
              name: 'pue-esbuild',
              setup(build) {
                build.onLoad({ filter: /\.vue$/ }, async (args) => {
                  const content = await fs.promises.readFile(args.path, 'utf-8')
                  if (!PURS_LANG_RE.test(content)) return undefined
                  return { contents: 'export default {}', loader: 'js' }
                })
              },
            }],
          },
        },
      }
    },

    configResolved(config) {
      root = config.root
    },

    configureServer(s) {
      server = s
    },

    buildStart() {
      ensureSpagoSources()
      if (scanAndExtract(root, srcDirs, moduleMap, modulePrefix)) {
        const result = compileSync(root, pursCommand)
        if (!result.success) {
          const errors = remapErrors(result.stderr, moduleMap)
          for (const e of errors) {
            console.error(`[pue] ${formatError(e)}`)
          }
        }
      }
    },

    transform(code, id) {
      if (!id.endsWith('.vue')) return null

      const result = extract(code, id, modulePrefix)
      if (!result) return null

      const { moduleName, code: pursCode, fullMatch } = result
      const exports = getExports(moduleName)
      const compiledPath = path.join(root, outputDir, moduleName, 'index.js')

      const transformed = transformSFC(
        pursCode,
        fullMatch,
        code,
        compiledPath,
        exports,
        path.join(root, outputDir),
        moduleName,
      )

      return { code: transformed, map: null }
    },

    async handleHotUpdate(ctx) {
      if (!ctx.file.endsWith('.vue')) return

      const content = await ctx.read()
      const result = extract(content, ctx.file, modulePrefix)
      if (!result) return

      writePursFile(root, result.moduleName, result.code)
      moduleMap.set(result.moduleName, ctx.file)

      const compileResult = await compileAsync(root, pursCommand)

      if (!compileResult.success) {
        const errors = remapErrors(compileResult.stderr, moduleMap)
        const message = errors.map(formatError).join('\n')

        server?.config.logger.error(`[pue] Compilation failed:\n${message}`)

        server?.ws.send({
          type: 'error',
          err: {
            message: `PureScript compilation failed`,
            stack: message,
            plugin: 'vite-plugin-pue',
          },
        })

        return []
      }

      log(`recompiled: ${result.moduleName}`)

      const invalidated: import('vite').ModuleNode[] = []
      for (const [, file] of moduleMap) {
        const modules = server?.moduleGraph.getModulesByFile(file)
        if (modules) {
          for (const m of modules) {
            server?.moduleGraph.invalidateModule(m)
            invalidated.push(m)
          }
        }
      }

      if (invalidated.length > 0) {
        log(`invalidated ${invalidated.length} modules`)
      }
    },
  }
}
