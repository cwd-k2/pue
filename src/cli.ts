#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

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

// ─── templates ─────────────────────────────────

const PACKAGE_SET =
  'https://github.com/purescript/package-sets/releases/download/psc-0.15.15-20260221/packages.dhall'

const tpl = {
  packageJson: (name: string) =>
    JSON.stringify(
      {
        name,
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          vue: '^3.5.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.2.0',
          pue: '^0.0.1',
          purescript: '^0.15.0',
          'purescript-language-server': '^0.17.0',
          'purs-tidy': '^0.10.0',
          spago: '^0.21.0',
          vite: '^6.0.0',
        },
      },
      null,
      2,
    ) + '\n',

  indexHtml: (name: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,

  viteConfig: () => `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pue } from 'pue'

export default defineConfig({
  plugins: [pue(), vue()],
})
`,

  tsconfig: () =>
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          jsx: 'preserve',
          resolveJsonModule: true,
          isolatedModules: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
        include: ['src/**/*.ts', 'src/**/*.vue'],
      },
      null,
      2,
    ) + '\n',

  packagesDhall: () => `let upstream =
      ${PACKAGE_SET}

in  upstream
`,

  spagoDhall: (name: string) => `{ name = "${name}"
, dependencies = [ "effect", "prelude" ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", ".pue/**/*.purs", "node_modules/pue/purescript/src/**/*.purs" ]
}
`,

  volarConfig: () => `module.exports = {
  plugins: [
    require.resolve('pue/editor/volar-plugin'),
  ],
}
`,

  gitignore: () => `node_modules/
dist/
.pue/
output/
`,

  mainTs: () => `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`,

  appVue: () => `<template>
  <div class="app">
    <h1>{{ greeting }}</h1>
    <p class="label">{{ label }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, modifyRef)
import Welcome (greet, formatCount)

setup = do
  count <- ref 0
  let greeting = greet "pue"
  let label = formatCount <$> count
  let increment = modifyRef (_ + 1) count
  pure { greeting, label, increment }
</script>

<style>
:root {
  font-family: system-ui, sans-serif;
  color: #213547;
  background: #ffffff;
}

.app {
  max-width: 480px;
  margin: 20vh auto;
  text-align: center;
}

h1 {
  font-size: 2.4rem;
  font-weight: 300;
  letter-spacing: -0.02em;
}

.label {
  color: #888;
  margin: 1.5rem 0;
}

button {
  padding: 0.5rem 2rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

button:hover {
  border-color: #6c5ce7;
}
</style>
`,

  welcomePurs: () => `module Welcome where

import Prelude

greet :: String -> String
greet name = "Welcome to " <> name

formatCount :: Int -> String
formatCount 0 = "Click the button to get started"
formatCount 1 = "1 click"
formatCount n = show n <> " clicks"
`,

  envDts: () => `declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
`,

  vscodeSettings: () =>
    JSON.stringify(
      {
        'purescript.addSpagoSources': true,
        'purescript.formatter': 'purs-tidy',
        'purescript.pursExe': '${workspaceFolder}/node_modules/.bin/purs',
        'purescript.pscIdeServerExe':
          '${workspaceFolder}/node_modules/.bin/purescript-language-server',
        'purescript.formatExe':
          '${workspaceFolder}/node_modules/.bin/purs-tidy',
        'purescript.sourcePath': ['src/**/*.purs', '.pue/**/*.purs'],
      },
      null,
      2,
    ) + '\n',

  vscodeExtensions: () =>
    JSON.stringify(
      {
        recommendations: [
          'nwolverson.ide-purescript',
          'nwolverson.language-purescript',
          'Vue.volar',
        ],
      },
      null,
      2,
    ) + '\n',
}

// ─── pue editor neovim ────────────────────────

function editorNeovim() {
  const nvimDir = path.join(
    process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME!, '.config'),
    'nvim',
  )
  const targetDir = path.join(nvimDir, 'after', 'queries', 'vue')
  const targetFile = path.join(targetDir, 'injections.scm')
  const sourceFile = path.join(
    pueRoot,
    'editor',
    'neovim',
    'queries',
    'vue',
    'injections.scm',
  )

  if (!fs.existsSync(sourceFile)) {
    console.error('Source injection query not found:', sourceFile)
    process.exit(1)
  }

  fs.mkdirSync(targetDir, { recursive: true })

  if (fs.existsSync(targetFile)) {
    const existing = fs.readFileSync(targetFile, 'utf-8')
    const injection = fs.readFileSync(sourceFile, 'utf-8')
    if (
      existing.includes('pue-purescript') ||
      existing.includes('injection.language "purescript"')
    ) {
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
