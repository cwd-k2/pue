import { spawn, execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { CompileResult } from './types'

function resolveBinDir(root: string): string {
  let dir = root
  while (dir !== path.dirname(dir)) {
    const binDir = path.join(dir, 'node_modules', '.bin')
    if (fs.existsSync(binDir)) return binDir
    dir = path.dirname(dir)
  }
  return ''
}

function makeEnv(root: string): NodeJS.ProcessEnv {
  const binDir = resolveBinDir(root)
  return {
    ...process.env,
    PATH: [binDir, process.env.PATH].filter(Boolean).join(':'),
  }
}

/**
 * Run PureScript compilation asynchronously.
 */
export function compileAsync(root: string, command: string): Promise<CompileResult> {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(/\s+/)
    const child = spawn(cmd, args, {
      cwd: root,
      env: makeEnv(root),
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        errors: [],
        stderr,
      })
    })

    child.on('error', (err) => {
      resolve({
        success: false,
        errors: [{ kind: 'compilation', message: err.message }],
        stderr: err.message,
      })
    })
  })
}

/**
 * Run PureScript compilation synchronously (for buildStart).
 */
export function compileSync(root: string, command: string): CompileResult {
  try {
    execSync(command, {
      cwd: root,
      stdio: 'pipe',
      env: makeEnv(root),
    })
    return { success: true, errors: [], stderr: '' }
  } catch (e: any) {
    return {
      success: false,
      errors: [{ kind: 'compilation', message: e.message }],
      stderr: e.stderr?.toString() ?? e.message,
    }
  }
}
