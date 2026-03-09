import type { Plugin, ViteDevServer } from 'vite'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface PueOptions {
  outputDir?: string
}

// Match <script setup lang="purs"> in any attribute order
const PURS_SCRIPT_RE =
  /<script\s+(?=[^>]*\blang=["']purs["'])(?=[^>]*\bsetup\b)[^>]*>([\s\S]*?)<\/script>/

const MODULE_NAME_RE = /^\s*module\s+([\w.]+)/m

export function pue(options: PueOptions = {}): Plugin {
  const outputDir = options.outputDir ?? 'output'
  let root: string
  let server: ViteDevServer | undefined
  const moduleMap = new Map<string, string>()

  function extract(sfcContent: string) {
    const match = PURS_SCRIPT_RE.exec(sfcContent)
    if (!match) return null

    const code = match[1]
    const modMatch = MODULE_NAME_RE.exec(code)
    if (!modMatch) return null

    return {
      moduleName: modMatch[1],
      code,
      fullMatch: match[0],
    }
  }

  function writePursFile(moduleName: string, code: string): string {
    const parts = moduleName.split('.')
    const filePath = path.join(root, '.pue', ...parts.slice(0, -1), parts.at(-1) + '.purs')

    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, code.trim() + '\n')
    return filePath
  }

  // --- Binary resolution ---

  function resolveBinDir(): string {
    let dir = root
    while (dir !== path.dirname(dir)) {
      const binDir = path.join(dir, 'node_modules', '.bin')
      if (fs.existsSync(binDir)) return binDir
      dir = path.dirname(dir)
    }
    return ''
  }

  function exec(cmd: string) {
    const binDir = resolveBinDir()
    const env = { ...process.env, PATH: [binDir, process.env.PATH].filter(Boolean).join(':') }
    return execSync(cmd, { cwd: root, stdio: 'pipe', env })
  }

  function compile() {
    exec('spago build')
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

  // --- Export analysis ---

  function getExports(moduleName: string): string[] {
    const indexPath = path.join(root, outputDir, moduleName, 'index.js')
    if (!fs.existsSync(indexPath)) return []

    const content = fs.readFileSync(indexPath, 'utf-8')
    const exports: string[] = []

    const re = /export\s*\{([^}]+)\}/g
    let m
    while ((m = re.exec(content))) {
      for (const name of m[1].split(',')) {
        const trimmed = name.trim()
        if (trimmed && !trimmed.startsWith('$')) {
          exports.push(trimmed)
        }
      }
    }

    return [...new Set(exports)]
  }

  // --- Record field extraction from PureScript source ---

  function extractRecordFields(pursSource: string): string[] | null {
    // Inline: setup :: Effect { field :: Type, ... }
    const inlineRe = /setup\s*::[\s\S]*?\{/
    const inlineMatch = inlineRe.exec(pursSource)
    if (inlineMatch) {
      // Verify this is a type annotation (contains ::) not a record literal
      const before = pursSource.slice(0, inlineMatch.index + inlineMatch[0].length)
      if (before.includes('::')) {
        return fieldsFromBraces(pursSource, inlineMatch.index + inlineMatch[0].length)
      }
    }

    // Named: setup :: Effect TypeName
    const namedRe = /setup\s*::\s*(?:Effect\s+)([A-Z]\w*)/
    const namedMatch = namedRe.exec(pursSource)
    if (namedMatch) {
      const typeName = namedMatch[1]
      const typeRe = new RegExp(`type\\s+${typeName}\\s*(?:=|::)[^{]*\\{`)
      const typeMatch = typeRe.exec(pursSource)
      if (typeMatch) {
        return fieldsFromBraces(pursSource, typeMatch.index + typeMatch[0].length)
      }
    }

    return null
  }

  function fieldsFromBraces(source: string, start: number): string[] {
    let depth = 1
    let pos = start
    while (pos < source.length && depth > 0) {
      if (source[pos] === '{') depth++
      else if (source[pos] === '}') depth--
      pos++
    }
    const inner = source.slice(start, pos - 1)

    const fields: string[] = []
    const re = /(\w+)\s*::/g
    let m
    while ((m = re.exec(inner))) {
      fields.push(m[1])
    }
    return fields
  }

  // --- SFC transform ---

  function transformSFC(code: string): string | null {
    const result = extract(code)
    if (!result) return null

    const { moduleName, code: pursCode, fullMatch } = result
    const exports = getExports(moduleName)

    if (exports.length === 0) {
      return code.replace(fullMatch, '<script setup>\n/* pue: no exports */\n</script>')
    }

    const compiledPath = path.join(root, outputDir, moduleName, 'index.js')
    const hasSetup = exports.includes('setup')
    const lines: string[] = []

    if (hasSetup) {
      const fields = extractRecordFields(pursCode)
      const pureExports = exports.filter(e => e !== 'setup')

      if (fields && fields.length > 0) {
        if (pureExports.length > 0) {
          lines.push(`import { setup as __pue_setup, ${pureExports.join(', ')} } from '${compiledPath}'`)
        } else {
          lines.push(`import { setup as __pue_setup } from '${compiledPath}'`)
        }
        lines.push(`const { ${fields.join(', ')} } = __pue_setup()`)
      } else {
        // Fallback: can't determine fields, import setup raw
        lines.push(`import { setup as __pue_setup } from '${compiledPath}'`)
        lines.push(`const __pue_bindings = __pue_setup()`)
      }
    } else {
      // No setup: import all exports directly
      lines.push(`import { ${exports.join(', ')} } from '${compiledPath}'`)
    }

    const newScript = `<script setup>\n${lines.join('\n')}\n</script>`
    return code.replace(fullMatch, newScript)
  }

  // --- File scanning ---

  function scanAndExtract(): boolean {
    const srcDir = path.join(root, 'src')
    const vueFiles = findVueFiles(srcDir)
    let found = false

    for (const file of vueFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const result = extract(content)
      if (result) {
        writePursFile(result.moduleName, result.code)
        moduleMap.set(result.moduleName, file)
        found = true
      }
    }

    return found
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
                  if (!PURS_SCRIPT_RE.test(content)) return undefined
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
      if (scanAndExtract()) {
        compile()
      }
    },

    transform(code, id) {
      if (!id.endsWith('.vue')) return null
      const transformed = transformSFC(code)
      if (!transformed) return null
      return { code: transformed, map: null }
    },

    handleHotUpdate({ file }) {
      if (!file.endsWith('.vue')) return

      const content = fs.readFileSync(file, 'utf-8')
      const result = extract(content)
      if (!result) return

      writePursFile(result.moduleName, result.code)
      moduleMap.set(result.moduleName, file)

      try {
        compile()
      } catch (e: any) {
        server?.config.logger.error(
          `[pue] Compilation failed:\n${e.stderr?.toString() ?? e.message}`
        )
        return []
      }
    },
  }
}

function findVueFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      files.push(...findVueFiles(full))
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      files.push(full)
    }
  }
  return files
}
