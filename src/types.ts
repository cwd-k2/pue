export interface PueOptions {
  outputDir?: string
  srcDirs?: string[]
  pursCommand?: string
  debug?: boolean
  modulePrefix?: string
}

export interface ExtractResult {
  moduleName: string
  code: string
  fullMatch: string
}

export interface PueError {
  kind: 'extraction' | 'compilation' | 'transform' | 'config'
  file?: string
  module?: string
  message: string
  location?: { line: number; column: number }
}

export interface CompileResult {
  success: boolean
  errors: PueError[]
  stderr: string
}
