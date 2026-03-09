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

  function ensureSpagoSources() {
    const dhallPath = path.join(root, 'spago.dhall')
    if (!fs.existsSync(dhallPath)) return

    const content = fs.readFileSync(dhallPath, 'utf-8')
    if (!content.includes('.pue')) {
      const updated = content.replace(
        /,\s*sources\s*=\s*\[/,
        ', sources = [ ".pue/**/*.purs", '
      )
      if (updated !== content) {
        fs.writeFileSync(dhallPath, updated)
      }
    }
  }

  function getExports(moduleName: string): string[] {
    const indexPath = path.join(root, outputDir, moduleName, 'index.js')
    if (!fs.existsSync(indexPath)) return []

    const content = fs.readFileSync(indexPath, 'utf-8')
    const exports: string[] = []

    // PureScript output: export { name1, name2, ... };
    const re = /export\s*\{([^}]+)\}/g
    let m
    while ((m = re.exec(content))) {
      for (const name of m[1].split(',')) {
        const trimmed = name.trim()
        // Filter out internal names (type class dictionaries, foreign, etc.)
        if (trimmed && !trimmed.startsWith('$')) {
          exports.push(trimmed)
        }
      }
    }

    return [...new Set(exports)]
  }

  function transformSFC(code: string): string | null {
    const result = extract(code)
    if (!result) return null

    const { moduleName, fullMatch } = result
    const exports = getExports(moduleName)

    if (exports.length === 0) {
      return code.replace(fullMatch, '<script setup>\n/* pue: no exports */\n</script>')
    }

    const compiledPath = path.join(root, outputDir, moduleName, 'index.js')
    const importLine = `import { ${exports.join(', ')} } from '${compiledPath}'`

    return code.replace(fullMatch, `<script setup>\n${importLine}\n</script>`)
  }

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
