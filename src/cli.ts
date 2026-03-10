#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { tpl } from './templates'

const HELP = `
pue - PureScript in Vue SFCs

Usage:
  pue init <project>      Create a new pue project
  pue editor neovim       Install Neovim support (tree-sitter + LSP)
  pue editor vscode       Install VSCode syntax extension
  pue editor volar        Set up Volar integration
  pue help                Show this help
`.trim()

const pueRoot = path.resolve(import.meta.dirname, '..')

function main() {
  const [cmd, sub] = process.argv.slice(2)

  if (!cmd || cmd === 'help' || cmd === '--help') {
    console.log(HELP)
    return
  }

  switch (cmd) {
    case 'init':
      return init(sub)
    case 'editor':
      switch (sub) {
        case 'neovim': return editorNeovim()
        case 'vscode': return editorVscode()
        case 'volar': return editorVolar()
        default:
          console.log('Usage: pue editor <neovim|vscode|volar>')
          return
      }
    default:
      console.log(`Unknown command: ${cmd}\n`)
      console.log(HELP)
      process.exit(1)
  }
}

// ─── pue init ──────────────────────────────────

function init(name?: string) {
  if (!name) {
    console.error('Usage: pue init <project-name>')
    process.exit(1)
  }

  const dir = path.resolve(process.cwd(), name)

  if (fs.existsSync(dir)) {
    console.error(`Already exists: ${name}`)
    process.exit(1)
  }

  console.log(`\nCreating ${name} ...\n`)

  // Project config
  emit(dir, 'package.json', tpl.packageJson(name))
  emit(dir, 'index.html', tpl.indexHtml(name))
  emit(dir, 'vite.config.ts', tpl.viteConfig())
  emit(dir, 'tsconfig.json', tpl.tsconfig())
  emit(dir, 'packages.dhall', tpl.packagesDhall())
  emit(dir, 'spago.dhall', tpl.spagoDhall(name))
  emit(dir, 'volar.config.js', tpl.volarConfig())
  emit(dir, '.gitignore', tpl.gitignore())

  // Source
  emit(dir, 'src/main.ts', tpl.mainTs())
  emit(dir, 'src/App.vue', tpl.appVue())
  emit(dir, 'src/Welcome.purs', tpl.welcomePurs())
  emit(dir, 'src/env.d.ts', tpl.envDts())

  // VSCode
  emit(dir, '.vscode/settings.json', tpl.vscodeSettings())
  emit(dir, '.vscode/extensions.json', tpl.vscodeExtensions())
  installVscodeExtension()

  console.log(`
Done.

  cd ${name}
  npm install
  code .
  npm run dev
`)
}

// ─── pue editor neovim ────────────────────────

function editorNeovim() {
  const targetFile = path.join(process.cwd(), '.nvim.lua')

  if (fs.existsSync(targetFile)) {
    const existing = fs.readFileSync(targetFile, 'utf-8')
    if (existing.includes('injection.language "purescript"')) {
      console.log('.nvim.lua already contains pue config.')
      return
    }
    fs.writeFileSync(targetFile, existing.trimEnd() + '\n\n' + tpl.nvimLua())
    console.log('Appended pue config to .nvim.lua')
  } else {
    fs.writeFileSync(targetFile, tpl.nvimLua())
    console.log('Created .nvim.lua')
  }

  console.log(`
Neovim setup:

1. Ensure exrc is enabled:
   vim.o.exrc = true

2. Install tree-sitter PureScript parser:
   :TSInstall purescript

3. Install purescript-language-server if not present:
   npm install -g purescript-language-server purs-tidy
`)
}

// ─── pue editor vscode ────────────────────────

function editorVscode() {
  installVscodeExtension()
  console.log(`
VSCode setup:

1. Install the PureScript IDE extension (nwolverson.ide-purescript)
   for syntax grammar and language server support.

2. Reload VSCode to activate the pue syntax injection.
`)
}

// ─── pue editor volar ─────────────────────────

function editorVolar() {
  const sourceFile = path.join(pueRoot, 'editor', 'volar.config.js')
  const targetFile = path.join(process.cwd(), 'volar.config.js')

  if (!fs.existsSync(sourceFile)) {
    console.error('Volar config source not found:', sourceFile)
    process.exit(1)
  }

  if (fs.existsSync(targetFile)) {
    console.log('volar.config.js already exists, skipping.')
  } else {
    fs.copyFileSync(sourceFile, targetFile)
    console.log('Installed volar.config.js')
  }

  console.log(`
Volar setup complete.
This tells Vue language tools to recognize <script lang="purs"> blocks.
`)
}

// ─── utilities ─────────────────────────────────

function emit(base: string, rel: string, content: string) {
  const filepath = path.join(base, rel)
  fs.mkdirSync(path.dirname(filepath), { recursive: true })
  fs.writeFileSync(filepath, content)
  console.log(`  ${rel}`)
}

function installVscodeExtension() {
  const source = path.join(pueRoot, 'editor', 'vscode')
  const target = path.join(
    os.homedir(),
    '.vscode',
    'extensions',
    'pue-vscode',
  )

  if (!fs.existsSync(source)) {
    console.warn('  (vscode extension source not found, skipping)')
    return
  }

  copyDir(source, target)
  console.log('  ~/.vscode/extensions/pue-vscode')
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(s, d)
    } else {
      fs.copyFileSync(s, d)
    }
  }
}

main()
