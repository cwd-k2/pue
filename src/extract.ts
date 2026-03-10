import * as fs from 'node:fs'
import * as path from 'node:path'
import type { ExtractResult } from './types'

const PURS_LANG_RE =
  /<script\b(?=[^>]*\blang=["']purs["'])[^>]*>([\s\S]*?)<\/script>/

const MODULE_NAME_RE = /^\s*module\s+([\w.]+)/m

/**
 * Capitalise the first letter, convert kebab/snake segments to PascalCase.
 * `components` → `Components`, `my-form` → `MyForm`
 */
function toPascalCase(s: string): string {
  return s
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Derive a PureScript module name from a .vue file path.
 *
 * Computes the relative path from the closest srcDir, PascalCases each
 * segment, and prefixes with the module prefix.
 *
 * `src/components/Counter.vue` → `App.Components.Counter`
 */
export function moduleNameFromPath(
  filePath: string,
  root: string,
  srcDirs: string[],
  prefix: string,
): string {
  const absPath = path.resolve(filePath)

  for (const srcDir of srcDirs) {
    const absSrcDir = path.resolve(root, srcDir)
    if (absPath.startsWith(absSrcDir + path.sep)) {
      const relative = path.relative(absSrcDir, absPath)
      const withoutExt = relative.replace(/\.vue$/, '')
      const parts = withoutExt.split(path.sep).map(toPascalCase)
      return [prefix, ...parts].join('.')
    }
  }

  // Fallback: relative to root
  const relative = path.relative(root, absPath)
  const withoutExt = relative.replace(/\.vue$/, '')
  const parts = withoutExt.split(path.sep).map(toPascalCase)
  return [prefix, ...parts].join('.')
}

/**
 * Extract PureScript code from a Vue SFC.
 * If no `module` declaration is present, the caller-supplied fallback name is used.
 */
export function extract(
  sfcContent: string,
  fallbackModuleName?: string,
): ExtractResult | null {
  const match = PURS_LANG_RE.exec(sfcContent)
  if (!match) return null

  const raw = match[1]
  const modMatch = MODULE_NAME_RE.exec(raw)

  let moduleName: string
  let code: string

  if (modMatch) {
    moduleName = modMatch[1]
    code = raw
  } else if (fallbackModuleName) {
    moduleName = fallbackModuleName
    code = `module ${moduleName} where\n${raw}`
  } else {
    return null
  }

  return { moduleName, code, fullMatch: match[0] }
}

/**
 * Write extracted PureScript source to the .pue/ directory.
 */
export function writePursFile(root: string, moduleName: string, code: string): string {
  const parts = moduleName.split('.')
  const filePath = path.join(root, '.pue', ...parts.slice(0, -1), parts.at(-1) + '.purs')

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, code.trim() + '\n')
  return filePath
}

/**
 * Recursively find .vue files under the given directories.
 */
export function findVueFiles(dirs: string[]): string[] {
  const files: string[] = []
  for (const dir of dirs) {
    walkDir(dir, files)
  }
  return files
}

function walkDir(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      walkDir(full, out)
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      out.push(full)
    }
  }
}

/**
 * Scan source directories, extract PureScript from Vue SFCs.
 * Returns true if any PureScript was found.
 */
export function scanAndExtract(
  root: string,
  srcDirs: string[],
  moduleMap: Map<string, string>,
  modulePrefix: string,
): boolean {
  const absDirs = srcDirs.map(d => path.join(root, d))
  const vueFiles = findVueFiles(absDirs)
  let found = false

  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const modName = moduleNameFromPath(file, root, srcDirs, modulePrefix)
    const result = extract(content, modName)
    if (result) {
      writePursFile(root, result.moduleName, result.code)
      moduleMap.set(result.moduleName, file)
      found = true
    }
  }

  return found
}

/**
 * Scan source directories for standalone .purs files and register them
 * in the module map (for error remapping and HMR).
 */
export function scanStandalonePurs(
  root: string,
  srcDirs: string[],
  moduleMap: Map<string, string>,
): boolean {
  let found = false
  for (const srcDir of srcDirs) {
    const absDir = path.join(root, srcDir)
    if (walkDirPurs(absDir, moduleMap)) found = true
  }
  return found
}

function walkDirPurs(dir: string, moduleMap: Map<string, string>): boolean {
  if (!fs.existsSync(dir)) return false
  let found = false

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      if (walkDirPurs(full, moduleMap)) found = true
    } else if (entry.isFile() && entry.name.endsWith('.purs')) {
      const content = fs.readFileSync(full, 'utf-8')
      const modMatch = MODULE_NAME_RE.exec(content)
      if (modMatch) {
        moduleMap.set(modMatch[1], full)
        found = true
      }
    }
  }

  return found
}
