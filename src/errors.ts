import type { PueError } from './types'

/**
 * Remap .pue/ paths in compiler output back to the original .vue source paths.
 */
export function remapErrors(
  stderr: string,
  moduleMap: Map<string, string>,
): PueError[] {
  const errors: PueError[] = []
  const blocks = stderr.split(/(?=Error)/g)

  for (const block of blocks) {
    if (!block.trim()) continue

    const pathMatch = /at\s+(?:\.\.\/)?\.?pue[/\\]?([\w/\\]+)\.purs:(\d+):(\d+)\s*-\s*(\d+):(\d+)/
      .exec(block)

    let file: string | undefined
    let module_: string | undefined
    let location: PueError['location'] | undefined

    if (pathMatch) {
      const moduleName = pathMatch[1].replace(/[/\\]/g, '.')
      module_ = moduleName
      file = moduleMap.get(moduleName)
      location = {
        line: parseInt(pathMatch[2]),
        column: parseInt(pathMatch[3]),
      }
    }

    const messageMatch = /^\s{2,}(.+)$/m.exec(block)
    const message = messageMatch?.[1] ?? block.trim()

    errors.push({
      kind: 'compilation',
      file,
      module: module_,
      message,
      location,
    })
  }

  return errors
}

/**
 * Format a PueError for display.
 */
export function formatError(error: PueError): string {
  const parts: string[] = []

  if (error.file && error.location) {
    parts.push(`${error.file}:${error.location.line}:${error.location.column}`)
  } else if (error.module) {
    parts.push(`[${error.module}]`)
  }

  parts.push(error.message)
  return parts.join(' — ')
}
