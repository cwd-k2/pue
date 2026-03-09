import type { Plugin, ViteDevServer } from 'vite'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface PueOptions {
  outputDir?: string
}

// Match any <script> with lang="purs" (with or without setup)
const PURS_LANG_RE =
  /<script\b(?=[^>]*\blang=["']purs["'])[^>]*>([\s\S]*?)<\/script>/

const MODULE_NAME_RE = /^\s*module\s+([\w.]+)/m

interface ExtractResult {
  moduleName: string
  code: string
  fullMatch: string
  isSetup: boolean
}

export function pue(options: PueOptions = {}): Plugin {
  const outputDir = options.outputDir ?? 'output'
  let root: string
  let server: ViteDevServer | undefined
  const moduleMap = new Map<string, string>()

  function extract(sfcContent: string): ExtractResult | null {
    const match = PURS_LANG_RE.exec(sfcContent)
    if (!match) return null

    const tag = match[0].slice(0, match[0].indexOf('>'))
    const isSetup = /\bsetup\b/.test(tag)

    const code = match[1]
    const modMatch = MODULE_NAME_RE.exec(code)
    if (!modMatch) return null

    return { moduleName: modMatch[1], code, fullMatch: match[0], isSetup }
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

    // Fallback: pure { field1, field2, ... } or pure { field1, name: val, ... }
    const pureRe = /pure\s*\{([^}]+)\}/
    const pureMatch = pureRe.exec(pursSource)
    if (pureMatch) {
      const fields: string[] = []
      for (const entry of pureMatch[1].split(',')) {
        const trimmed = entry.trim()
        const colonMatch = trimmed.match(/^(\w+)\s*:(?!:)/)
        if (colonMatch) {
          fields.push(colonMatch[1])
        } else if (/^\w+$/.test(trimmed)) {
          fields.push(trimmed)
        }
      }
      if (fields.length > 0) return fields
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

  // --- Props/emits extraction ---

  function extractStringArray(source: string, name: string): string[] | null {
    const re = new RegExp(`^${name}\\s*=\\s*\\[([^\\]]+)\\]`, 'm')
    const match = re.exec(source)
    if (!match) return null
    return match[1].split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean)
  }

  function extractDefineRecord(source: string, name: string): Record<string, string> | null {
    const re = new RegExp(`^${name}\\s*::\\s*\\w+\\s*\\{([^}]+)\\}`, 'm')
    const match = re.exec(source)
    if (!match) return null

    const result: Record<string, string> = {}
    for (const field of match[1].split(',')) {
      const m = field.trim().match(/^(\w+)\s*::\s*(.+?)\s*$/)
      if (m) result[m[1]] = m[2]
    }
    return Object.keys(result).length > 0 ? result : null
  }

  function pursTypeToVue(type: string): string | null {
    switch (type) {
      case 'String': return 'String'
      case 'Int': case 'Number': return 'Number'
      case 'Boolean': return 'Boolean'
      default: return null
    }
  }

  function extractDefineModel(source: string): Record<string, string> | null {
    return extractDefineRecord(source, 'model')
  }

  function extractOptionsRecord(source: string): string | null {
    const re = /^options\s*=\s*\{([^}]+)\}/m
    const match = re.exec(source)
    if (!match) return null
    return match[1].trim()
  }

  function countSetupArgs(source: string): number {
    if (/^setup\s+(?:\{[^}]*\}|\w+)\s+(?:\{[^}]*\}|\w+)\s*=/m.test(source)) return 2
    if (/^setup\s+(?:\{[^}]*\}|\w+)\s*=/m.test(source)) return 1
    return 0
  }

  // --- SFC transform ---

  function transformSetupSFC(
    pursCode: string,
    fullMatch: string,
    sfcContent: string,
    compiledPath: string,
    exports: string[],
  ): string {
    const hasSetup = exports.includes('setup')
    const lines: string[] = []
    const components = extractStringArray(pursCode, 'components')
    const exposeMap = extractDefineRecord(pursCode, 'expose')
    const optionsRecord = extractOptionsRecord(pursCode)

    if (components) {
      for (const c of components) lines.push(`import ${c} from './${c}.vue'`)
    }

    if (hasSetup) {
      const fields = extractRecordFields(pursCode)
      const fieldSet = new Set(fields ?? [])
      const metaExports = new Set(['setup', 'components', 'expose', 'options', 'slots'])
      const pureExports = exports.filter(e => !metaExports.has(e) && !fieldSet.has(e))

      if (fields && fields.length > 0) {
        if (pureExports.length > 0) {
          lines.push(`import { setup as __pue_setup, ${pureExports.join(', ')} } from '${compiledPath}'`)
        } else {
          lines.push(`import { setup as __pue_setup } from '${compiledPath}'`)
        }
        lines.push(`const { ${fields.join(', ')} } = __pue_setup()`)
      } else {
        lines.push(`import { setup as __pue_setup } from '${compiledPath}'`)
        lines.push(`const __pue_bindings = __pue_setup()`)
      }
    } else {
      const metaExports = new Set(['components', 'expose', 'options', 'slots'])
      lines.push(`import { ${exports.filter(e => !metaExports.has(e)).join(', ')} } from '${compiledPath}'`)
    }

    if (exposeMap) {
      lines.push(`defineExpose({ ${Object.keys(exposeMap).join(', ')} })`)
    }
    if (optionsRecord) {
      lines.push(`defineOptions({ ${optionsRecord} })`)
    }

    return sfcContent.replace(fullMatch, `<script setup>\n${lines.join('\n')}\n</script>`)
  }

  function transformOptionsSFC(
    pursCode: string,
    fullMatch: string,
    sfcContent: string,
    compiledPath: string,
    exports: string[],
  ): string {
    const hasSetup = exports.includes('setup')
    const hasComponent = exports.includes('component')
    const lines: string[] = []

    const components = extractStringArray(pursCode, 'components')

    if (components) {
      for (const c of components) lines.push(`import ${c} from './${c}.vue'`)
    }

    if (hasSetup) {
      const fields = extractRecordFields(pursCode)
      const fieldSet = new Set(fields ?? [])

      const definePropsMap = extractDefineRecord(pursCode, 'props')
      const defineEmitsMap = extractDefineRecord(pursCode, 'emits')
      const modelMap = extractDefineModel(pursCode)
      const propsArray = extractStringArray(pursCode, 'props')
      const emitsArray = extractStringArray(pursCode, 'emits')
      const setupArgs = countSetupArgs(pursCode)

      const exposeMap = extractDefineRecord(pursCode, 'expose')
      const optionsRecord = extractOptionsRecord(pursCode)

      const metaExports = new Set(['setup', 'props', 'emits', 'model', 'components', 'expose', 'options', 'slots'])
      const pureExports = exports.filter(e => !metaExports.has(e) && !fieldSet.has(e))

      const importNames = ['setup as __pue_setup', ...pureExports]
      lines.push(`import { ${importNames.join(', ')} } from '${compiledPath}'`)

      const options: string[] = []
      if (components) options.push(`components: { ${components.join(', ')} }`)
      if (exposeMap) options.push(`expose: ${JSON.stringify(Object.keys(exposeMap))}`)
      if (optionsRecord) options.push(optionsRecord)

      // Props: DefineProps + DefineModel → typed object, else string array
      const propsEntries: string[] = []
      if (definePropsMap) {
        for (const [name, type] of Object.entries(definePropsMap)) {
          const vueType = pursTypeToVue(type)
          propsEntries.push(vueType ? `${name}: { type: ${vueType} }` : name)
        }
      }
      if (modelMap) {
        for (const [name, type] of Object.entries(modelMap)) {
          const vueType = pursTypeToVue(type)
          propsEntries.push(vueType ? `${name}: { type: ${vueType} }` : name)
        }
      }
      if (propsEntries.length > 0) {
        options.push(`props: { ${propsEntries.join(', ')} }`)
      } else if (propsArray) {
        options.push(`props: ${JSON.stringify(propsArray)}`)
      }

      // Emits: merge DefineEmits + string array + DefineModel
      const allEmits: string[] = []
      if (defineEmitsMap) allEmits.push(...Object.keys(defineEmitsMap))
      if (emitsArray) allEmits.push(...emitsArray)
      if (modelMap) {
        for (const name of Object.keys(modelMap)) allEmits.push(`update:${name}`)
      }
      if (allEmits.length > 0) options.push(`emits: ${JSON.stringify(allEmits)}`)

      if (setupArgs >= 2) {
        options.push(`setup(__props, { emit }) { return __pue_setup(__props)((name) => (value) => () => emit(name, value))() }`)
      } else if (setupArgs === 1) {
        options.push(`setup(__props) { return __pue_setup(__props)() }`)
      } else if (fields && fields.length > 0) {
        options.push(`setup() { return __pue_setup() }`)
      } else {
        options.push(`setup: __pue_setup`)
      }

      lines.push(`export default { ${options.join(', ')} }`)
    } else if (hasComponent) {
      lines.push(`export { component as default } from '${compiledPath}'`)
    } else {
      lines.push(`import * as __pue from '${compiledPath}'`)
      lines.push(`export default __pue`)
    }

    return sfcContent.replace(fullMatch, `<script>\n${lines.join('\n')}\n</script>`)
  }

  function transformSFC(code: string): string | null {
    const result = extract(code)
    if (!result) return null

    const { moduleName, code: pursCode, fullMatch, isSetup } = result
    const exports = getExports(moduleName)

    if (exports.length === 0) {
      const tag = isSetup ? '<script setup>' : '<script>'
      return code.replace(fullMatch, `${tag}\n/* pue: no exports */\n</script>`)
    }

    const compiledPath = path.join(root, outputDir, moduleName, 'index.js')

    return isSetup
      ? transformSetupSFC(pursCode, fullMatch, code, compiledPath, exports)
      : transformOptionsSFC(pursCode, fullMatch, code, compiledPath, exports)
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
