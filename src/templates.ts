const PACKAGE_SET =
  'https://github.com/purescript/package-sets/releases/download/psc-0.15.15-20260221/packages.dhall'

export const tpl = {
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
