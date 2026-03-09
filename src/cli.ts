#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

const HELP = `
pue - PureScript in Vue SFCs

Usage:
  pue init                Set up PureScript project for pue
  pue editor neovim       Install Neovim support (tree-sitter + LSP)
  pue editor vscode       Install VSCode syntax extension
  pue editor volar        Set up Volar integration
  pue help                Show this help
`.trim()

const cwd = process.cwd()
const pueRoot = path.resolve(import.meta.dirname, '..')

function main() {
  const [cmd, sub] = process.argv.slice(2)

  if (!cmd || cmd === 'help' || cmd === '--help') {
    console.log(HELP)
    return
  }

  switch (cmd) {
    case 'init':
      return init()
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

// --- pue init ---

function init() {
  const packagesDhall = path.join(cwd, 'packages.dhall')
  const spagoDhall = path.join(cwd, 'spago.dhall')
  const gitignore = path.join(cwd, '.gitignore')

  // packages.dhall
  if (!fs.existsSync(packagesDhall)) {
    console.log('Creating packages.dhall ...')
    const packageSetUrl = 'https://github.com/purescript/package-sets/releases/download/psc-0.15.15-20260221/packages.dhall'
    fs.writeFileSync(packagesDhall, [
      `let upstream =`,
      `      ${packageSetUrl}`,
      ``,
      `in  upstream`,
      ``,
    ].join('\n'))
  }

  // spago.dhall
  if (!fs.existsSync(spagoDhall)) {
    console.log('Creating spago.dhall ...')
    const projectName = path.basename(cwd)
    const pueLibSrc = resolvePueLibSrc()
    const sources = ['"src/**/*.purs"', '".pue/**/*.purs"']
    if (pueLibSrc) sources.push(`"${pueLibSrc}/**/*.purs"`)

    fs.writeFileSync(spagoDhall, [
      `{ name = "${projectName}"`,
      `, dependencies = [ "effect", "prelude" ]`,
      `, packages = ./packages.dhall`,
      `, sources = [ ${sources.join(', ')} ]`,
      `}`,
      '',
    ].join('\n'))
  }

  // .gitignore
  ensureGitignore(gitignore, ['.pue/', 'output/'])

  console.log('Done. PureScript project ready for pue.')
}

function resolvePueLibSrc(): string | null {
  const candidates = [
    path.resolve(cwd, 'node_modules', 'pue', 'purescript', 'src'),
    path.resolve(cwd, '..', 'purescript', 'src'),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return path.relative(cwd, c).replace(/\\/g, '/')
  }
  return null
}

function ensureGitignore(filepath: string, entries: string[]) {
  let content = ''
  if (fs.existsSync(filepath)) {
    content = fs.readFileSync(filepath, 'utf-8')
  }
  const toAdd = entries.filter(e => !content.includes(e))
  if (toAdd.length > 0) {
    const suffix = content.endsWith('\n') || content === '' ? '' : '\n'
    fs.writeFileSync(filepath, content + suffix + toAdd.join('\n') + '\n')
    console.log(`Added to .gitignore: ${toAdd.join(', ')}`)
  }
}

// --- pue editor neovim ---

function editorNeovim() {
  const nvimDir = path.join(
    process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME!, '.config'),
    'nvim',
  )
  const targetDir = path.join(nvimDir, 'after', 'queries', 'vue')
  const targetFile = path.join(targetDir, 'injections.scm')
  const sourceFile = path.join(pueRoot, 'editor', 'neovim', 'queries', 'vue', 'injections.scm')

  if (!fs.existsSync(sourceFile)) {
    console.error('Source injection query not found:', sourceFile)
    process.exit(1)
  }

  fs.mkdirSync(targetDir, { recursive: true })

  if (fs.existsSync(targetFile)) {
    const existing = fs.readFileSync(targetFile, 'utf-8')
    const injection = fs.readFileSync(sourceFile, 'utf-8')
    if (existing.includes('pue-purescript') || existing.includes('injection.language "purescript"')) {
      console.log('Tree-sitter injection already installed.')
    } else {
      fs.writeFileSync(targetFile, existing.trimEnd() + '\n\n' + injection)
      console.log(`Appended pue injection to ${targetFile}`)
    }
  } else {
    fs.copyFileSync(sourceFile, targetFile)
    console.log(`Installed ${targetFile}`)
  }

  console.log(`
Neovim setup:

1. Install tree-sitter PureScript parser:
   :TSInstall purescript

2. Add to your init.lua:
   require("lspconfig").purescriptls.setup({
     cmd = { "purescript-language-server", "--stdio" },
     root_dir = require("lspconfig").util.root_pattern("spago.dhall", "spago.yaml"),
     settings = { purescript = { formatter = "purs-tidy", addSpagoSources = true } },
   })

3. Install purescript-language-server if not present:
   npm install -g purescript-language-server purs-tidy
`)
}

// --- pue editor vscode ---

function editorVscode() {
  const sourceDir = path.join(pueRoot, 'editor', 'vscode')
  const targetDir = path.join(cwd, '.vscode', 'extensions', 'pue-vscode')

  if (!fs.existsSync(sourceDir)) {
    console.error('VSCode extension source not found:', sourceDir)
    process.exit(1)
  }

  copyDirSync(sourceDir, targetDir)
  console.log(`Installed VSCode extension to ${path.relative(cwd, targetDir)}`)
  console.log(`
VSCode setup:

1. Install the PureScript IDE extension (nwolverson.ide-purescript)
   for syntax grammar and language server support.

2. Reload VSCode to activate the pue syntax injection.
`)
}

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirSync(s, d)
    } else {
      fs.copyFileSync(s, d)
    }
  }
}

// --- pue editor volar ---

function editorVolar() {
  const sourceFile = path.join(pueRoot, 'editor', 'volar.config.js')
  const targetFile = path.join(cwd, 'volar.config.js')

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

main()
