import * as fs from 'node:fs'
import * as path from 'node:path'
import { readExterns, findPhantomRecord } from './externs'

/**
 * Analyse PureScript source + externs to generate a Vue SFC <script> replacement.
 */
export function transformSFC(
  pursCode: string,
  fullMatch: string,
  sfcContent: string,
  compiledPath: string,
  exports: string[],
  outputDir: string,
  moduleName: string,
): string {
  if (exports.length === 0) {
    return sfcContent.replace(fullMatch, `<script>\n/* pue: no exports */\n</script>`)
  }

  const hasSetup = exports.includes('setup')
  const hasComponent = exports.includes('component')

  if (hasComponent) {
    return sfcContent.replace(
      fullMatch,
      `<script>\nexport { component as default } from '${compiledPath}'\n</script>`,
    )
  }

  if (!hasSetup) {
    const metaExports = new Set(['components', 'expose', 'options', 'slots', 'defaults'])
    const pureExports = exports.filter(e => !metaExports.has(e))
    if (pureExports.length === 0) {
      return sfcContent.replace(fullMatch, `<script>\nexport default {}\n</script>`)
    }
    const lines = [
      `import { ${pureExports.join(', ')} } from '${compiledPath}'`,
      `export default { setup() { return { ${pureExports.join(', ')} } } }`,
    ]
    return sfcContent.replace(fullMatch, `<script>\n${lines.join('\n')}\n</script>`)
  }

  // --- Setup-based component ---
  const lines: string[] = []

  // Components
  const components = extractStringArray(pursCode, 'components')
  if (components) {
    for (const c of components) lines.push(`import ${c} from './${c}.vue'`)
  }

  // Analyse props/emits/model/expose via externs (primary) + regex (fallback)
  const externs = readExterns(outputDir, moduleName)

  const definePropsMap = externs
    ? findPhantomRecord(externs, 'DefineProps')
    : extractDefineRecord(pursCode, 'props')

  const defineEmitsMap = externs
    ? findPhantomRecord(externs, 'DefineEmits')
    : extractDefineRecord(pursCode, 'emits')

  const modelMap = externs
    ? findPhantomRecord(externs, 'DefineModel')
    : extractDefineRecord(pursCode, 'model')

  const exposeMap = externs
    ? findPhantomRecord(externs, 'DefineExpose')
    : extractDefineRecord(pursCode, 'expose')

  // Runtime values — always regex (not in type info)
  const propsArray = extractStringArray(pursCode, 'props')
  const emitsArray = extractStringArray(pursCode, 'emits')
  const defaultsMap = extractDefaultsRecord(pursCode)
  const optionsRecord = extractOptionsRecord(pursCode)
  const setupArgs = countSetupArgs(pursCode)

  // Determine which exports are metadata vs user bindings
  const fields = extractRecordFields(pursCode)
  const fieldSet = new Set(fields ?? [])
  const metaExports = new Set(['setup', 'props', 'emits', 'model', 'components', 'expose', 'options', 'slots', 'defaults'])
  const pureExports = exports.filter(e => !metaExports.has(e) && !fieldSet.has(e))

  const importNames = ['setup as __pue_setup', ...pureExports]
  lines.push(`import { ${importNames.join(', ')} } from '${compiledPath}'`)

  const options: string[] = []
  if (components) options.push(`components: { ${components.join(', ')} }`)
  if (exposeMap) options.push(`expose: ${JSON.stringify(Object.keys(exposeMap))}`)
  if (optionsRecord) options.push(optionsRecord)

  // Props
  const propsEntries: string[] = []
  if (definePropsMap) {
    for (const [name, type] of Object.entries(definePropsMap)) {
      propsEntries.push(propEntry(name, type, defaultsMap))
    }
  }
  if (modelMap) {
    for (const [name, type] of Object.entries(modelMap)) {
      propsEntries.push(propEntry(name, type, defaultsMap))
    }
  }
  if (propsEntries.length > 0) {
    options.push(`props: { ${propsEntries.join(', ')} }`)
  } else if (propsArray) {
    options.push(`props: ${JSON.stringify(propsArray)}`)
  }

  // Emits
  const allEmits: string[] = []
  if (defineEmitsMap) allEmits.push(...Object.keys(defineEmitsMap))
  if (emitsArray) allEmits.push(...emitsArray)
  if (modelMap) {
    for (const name of Object.keys(modelMap)) allEmits.push(`update:${name}`)
  }
  if (allEmits.length > 0) options.push(`emits: ${JSON.stringify(allEmits)}`)

  // Setup function
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
  return sfcContent.replace(fullMatch, `<script>\n${lines.join('\n')}\n</script>`)
}

// --- Regex-based extraction (for runtime values and fallback) ---

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
    if (m) result[m[1]] = pursTypeToVue(m[2]) ?? 'Object'
  }
  return Object.keys(result).length > 0 ? result : null
}

function pursTypeToVue(type: string): string | null {
  const t = type.trim()
  if (t.startsWith('Array')) return 'Array'
  if (t.startsWith('{')) return 'Object'
  if (t.startsWith('Effect')) return 'Function'
  switch (t) {
    case 'String': return 'String'
    case 'Int': case 'Number': return 'Number'
    case 'Boolean': return 'Boolean'
    default: return null
  }
}

function extractDefaultsRecord(source: string): Record<string, string> | null {
  const re = /^defaults\s*=\s*\{([^}]+)\}/m
  const match = re.exec(source)
  if (!match) return null

  const result: Record<string, string> = {}
  for (const field of match[1].split(',')) {
    const m = field.trim().match(/^(\w+)\s*:\s*(.+?)\s*$/)
    if (m) result[m[1]] = m[2]
  }
  return Object.keys(result).length > 0 ? result : null
}

function extractOptionsRecord(source: string): string | null {
  const re = /^options\s*=\s*\{([^}]+)\}/m
  const match = re.exec(source)
  if (!match) return null
  return match[1].trim()
}

function propEntry(name: string, type: string, defaultsMap: Record<string, string> | null): string {
  const parts: string[] = []
  parts.push(`type: ${type}`)
  const defaultVal = defaultsMap?.[name]
  if (defaultVal != null) parts.push(`default: ${defaultVal}`)
  return `${name}: { ${parts.join(', ')} }`
}

function countSetupArgs(source: string): number {
  if (/^setup\s+(?:\{[^}]*\}|\w+)\s+(?:\{[^}]*\}|\w+)\s*=/m.test(source)) return 2
  if (/^setup\s+(?:\{[^}]*\}|\w+)\s*=/m.test(source)) return 1
  return 0
}

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

  // Fallback: pure { field1, field2, ... }
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

/**
 * Get exports by parsing compiled JS output (fallback when externs unavailable).
 */
export function getExportsFromJS(root: string, outputDir: string, moduleName: string): string[] {
  const indexPath = path.join(root, outputDir, moduleName, 'index.js')
  if (!fs.existsSync(indexPath)) return []

  const content = fs.readFileSync(indexPath, 'utf-8')
  const exports: string[] = []

  const re = /export\s*\{([^}]+)\}/g
  let m
  while ((m = re.exec(content))) {
    for (const name of m[1].split(',')) {
      const trimmed = name.trim()
      if (trimmed && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
        exports.push(trimmed)
      }
    }
  }

  return [...new Set(exports)]
}
