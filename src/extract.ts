import * as fs from 'node:fs'
import * as path from 'node:path'
import type { ExtractResult } from './types'

const PURS_LANG_RE =
  /<script\b(?=[^>]*\blang=["']purs["'])[^>]*>([\s\S]*?)<\/script>/

const MODULE_NAME_RE = /^\s*module\s+([\w.]+)/m

/**
 * Extract PureScript code from a Vue SFC.
 */
export function extract(sfcContent: string): ExtractResult | null {
  const match = PURS_LANG_RE.exec(sfcContent)
  if (!match) return null

  const code = match[1]
  const modMatch = MODULE_NAME_RE.exec(code)
  if (!modMatch) return null

  return { moduleName: modMatch[1], code, fullMatch: match[0] }
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
): boolean {
  const absDirs = srcDirs.map(d => path.join(root, d))
  const vueFiles = findVueFiles(absDirs)
  let found = false

  for (const file of vueFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    const result = extract(content)
    if (result) {
      writePursFile(root, result.moduleName, result.code)
      moduleMap.set(result.moduleName, file)
      found = true
    }
  }

  return found
}
