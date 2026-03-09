import * as fs from 'node:fs'
import * as path from 'node:path'
import { decode as cborDecode } from 'cborg'

// --- Public types ---

export interface ExternsFile {
  version: string
  moduleName: string
  exports: string[]
  declarations: ExternsDeclaration[]
}

export type ExternsDeclaration =
  | { tag: 'value'; name: string; type: SourceType }
  | { tag: 'other' }

export type SourceType =
  | { tag: 'TypeConstructor'; module: string; name: string }
  | { tag: 'TypeApp'; fn: SourceType; arg: SourceType }
  | { tag: 'ForAll'; var: string; body: SourceType }
  | { tag: 'RCons'; label: string; type: SourceType; rest: SourceType }
  | { tag: 'REmpty' }
  | { tag: 'Unknown' }

// --- CBOR structure ---
//
// Actual externs.cbor format (PureScript 0.15.x):
//
// Top-level: [formatVersion, compilerVersion, moduleName, exports, imports,
//             fixities, typeFixities, declarations, sourceSpan]
//
// Each SourceType node: [tag, [sourceSpan, annotations], ...fields]
//   tag 5  TypeConstructor: [5, SA, [0, [1, "Module"], [0, "Name"]]]
//   tag 7  TypeApp:         [7, SA, fnType, argType]
//   tag 9  ForAll:          [9, SA, ann, varName, kind, body, scope, vis]
//   tag 12 REmpty:          [12, SA]
//   tag 13 RCons:           [13, SA, labelName, fieldType, restRow]
//   tag 8  KindApp:         [8, SA, type, kind] (treat as REmpty when at row tail)
//
// Declaration names: [nameTag, "string"]
// Qualified names:   [0, [1, "Module"], [0, "Name"]]
// Record labels:     [0, [0, codeUnitArray]]

function decodeSourceType(raw: unknown): SourceType {
  if (!Array.isArray(raw) || raw.length < 2) return { tag: 'Unknown' }

  const tagNum = raw[0]
  if (typeof tagNum !== 'number') return { tag: 'Unknown' }

  // Fields start after [tag, [sourceSpan, annotations]]
  // So raw[2], raw[3], etc. are the type-specific fields

  switch (tagNum) {
    case 5: { // TypeConstructor
      const qualName = raw[2]
      if (!Array.isArray(qualName) || qualName.length < 3) return { tag: 'Unknown' }
      // qualName = [0, [1, "Module"], [0, "Name"]]
      const modulePart = extractNameString(qualName[1])
      const namePart = extractNameString(qualName[2])
      return { tag: 'TypeConstructor', module: modulePart, name: namePart }
    }
    case 7: { // TypeApp
      return {
        tag: 'TypeApp',
        fn: decodeSourceType(raw[2]),
        arg: decodeSourceType(raw[3]),
      }
    }
    case 9: { // ForAll — [9, SA, ann, varName, kind, body, scope, vis]
      const varName = extractNameString(raw[3])
      const body = decodeSourceType(raw[5])
      return { tag: 'ForAll', var: varName, body }
    }
    case 13: { // RCons — [13, SA, labelName, fieldType, restRow]
      const label = extractRecordLabel(raw[2])
      const type = decodeSourceType(raw[3])
      const rest = decodeSourceType(raw[4])
      return { tag: 'RCons', label, type, rest }
    }
    case 12: // REmpty
      return { tag: 'REmpty' }
    case 8: // KindApp — treat as REmpty when at row tail
      return { tag: 'REmpty' }
    default:
      return { tag: 'Unknown' }
  }
}

/**
 * Extract a name string from CBOR name encoding.
 * Names are [tag, value] where tag indicates the name kind:
 *   [0, "string"]  — Ident or ProperName with direct string
 *   [1, "string"]  — ModuleName
 *   [0, [codeUnits...]] — label as code unit array
 */
function extractNameString(raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (!Array.isArray(raw)) return String(raw ?? '')
  if (raw.length >= 2 && typeof raw[1] === 'string') return raw[1]
  if (raw.length >= 2 && Array.isArray(raw[1])) return decodeCodeUnits(raw[1])
  if (raw.length >= 1 && typeof raw[0] === 'string') return raw[0]
  return ''
}

/**
 * Extract a record field label.
 * Labels are encoded as [0, [0, codeUnitArray]].
 */
function extractRecordLabel(raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (!Array.isArray(raw)) return String(raw ?? '')

  // [0, [0, [c1, c2, ...]]]
  if (raw.length >= 2 && Array.isArray(raw[1])) {
    const inner = raw[1]
    if (Array.isArray(inner) && inner.length >= 1 && Array.isArray(inner[0])) {
      return decodeCodeUnits(inner[0])
    }
    if (inner.length >= 2 && Array.isArray(inner[1])) {
      return decodeCodeUnits(inner[1])
    }
    return decodeCodeUnits(inner)
  }

  return String(raw)
}

/**
 * Decode an array of UTF-16 code units to a string.
 */
function decodeCodeUnits(arr: unknown[]): string {
  return arr
    .filter((c): c is number => typeof c === 'number')
    .map(c => String.fromCharCode(c))
    .join('')
}

/**
 * Decode an ExternsDeclaration.
 * EDValue = [3, name, type]
 */
function decodeDeclaration(raw: unknown): ExternsDeclaration {
  if (!Array.isArray(raw) || raw.length < 3) return { tag: 'other' }

  const tagNum = raw[0]
  if (tagNum !== 3) return { tag: 'other' } // Only care about EDValue

  const name = extractNameString(raw[1])
  const type = decodeSourceType(raw[2])
  return { tag: 'value', name, type }
}

const JS_IDENT_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

function isValidJSIdentifier(name: string): boolean {
  return JS_IDENT_RE.test(name)
}

/**
 * Decode export entries.
 * Export entries: [3, sourceSpan, [0, "name"]]
 */
function decodeExport(raw: unknown): string | null {
  if (!Array.isArray(raw) || raw.length < 3) return null
  const ident = raw[2]
  const name = extractNameString(ident)
  return name && isValidJSIdentifier(name) ? name : null
}

// --- Public API ---

/**
 * Read and decode an externs.cbor file.
 */
export function readExterns(outputDir: string, moduleName: string): ExternsFile | null {
  const externsPath = path.join(outputDir, moduleName, 'externs.cbor')
  if (!fs.existsSync(externsPath)) return null

  let top: unknown[]
  try {
    const buf = fs.readFileSync(externsPath)
    top = cborDecode(new Uint8Array(buf)) as unknown[]
  } catch {
    return null
  }

  if (!Array.isArray(top) || top.length < 8) return null

  // [0]=formatVersion, [1]=compilerVersion, [2]=moduleName,
  // [3]=exports, [4]=imports, [5]=fixities, [6]=typeFixities,
  // [7]=declarations, [8]=sourceSpan
  const version = String(top[1])
  const moduleNameStr = String(top[2])

  const rawExports = Array.isArray(top[3]) ? top[3] : []
  const exports = rawExports
    .map(decodeExport)
    .filter((e): e is string => e != null)

  const rawDecls = Array.isArray(top[7]) ? top[7] : []
  const declarations = rawDecls.map(decodeDeclaration)

  return { version, moduleName: moduleNameStr, exports, declarations }
}

/**
 * Find a phantom type declaration (DefineProps, DefineEmits, etc.)
 * and extract the record fields from its type argument.
 */
export function findPhantomRecord(
  externs: ExternsFile,
  phantomTypeName: string,
): Record<string, string> | null {
  for (const decl of externs.declarations) {
    if (decl.tag !== 'value') continue

    const recordType = unwrapPhantomType(decl.type, phantomTypeName)
    if (recordType) {
      const fields = extractRecordFields(recordType)
      if (Object.keys(fields).length > 0) return fields
    }
  }
  return null
}

function unwrapPhantomType(type: SourceType, phantomName: string): SourceType | null {
  if (type.tag === 'ForAll') {
    return unwrapPhantomType(type.body, phantomName)
  }

  if (type.tag === 'TypeApp') {
    if (type.fn.tag === 'TypeConstructor' && type.fn.name === phantomName) {
      return type.arg
    }
  }

  return null
}

function extractRecordFields(type: SourceType): Record<string, string> {
  if (type.tag === 'TypeApp' &&
      type.fn.tag === 'TypeConstructor' &&
      type.fn.name === 'Record') {
    return walkRow(type.arg)
  }

  if (type.tag === 'RCons') return walkRow(type)

  return {}
}

function walkRow(type: SourceType): Record<string, string> {
  const fields: Record<string, string> = {}
  let current = type
  while (current.tag === 'RCons') {
    fields[current.label] = sourceTypeToVue(current.type)
    current = current.rest
  }
  return fields
}

/**
 * Map a PureScript SourceType to a Vue prop type string.
 */
export function sourceTypeToVue(type: SourceType): string {
  if (type.tag === 'TypeConstructor') {
    switch (type.name) {
      case 'String': return 'String'
      case 'Int': case 'Number': return 'Number'
      case 'Boolean': return 'Boolean'
      case 'Array': return 'Array'
      case 'Record': return 'Object'
      default: return 'Object'
    }
  }

  if (type.tag === 'TypeApp' && type.fn.tag === 'TypeConstructor') {
    switch (type.fn.name) {
      case 'Array': return 'Array'
      case 'Record': return 'Object'
      case 'Effect': return 'Function'
    }
    return 'Object'
  }

  return 'Object'
}

/**
 * Get exported identifiers from externs.
 */
export function getExportsFromExterns(outputDir: string, moduleName: string): string[] | null {
  const externs = readExterns(outputDir, moduleName)
  if (!externs) return null
  return externs.exports
}
