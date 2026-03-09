# pue

Write PureScript in Vue Single File Components.

```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup lang="purs">
module App.Counter where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, modifyRef)

setup :: Effect { count :: Ref Int, increment :: Effect Unit }
setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
```

PureScript's type system meets Vue's reactivity. No code generation, no separate files — just `lang="purs"` in your `<script>` block.

## Install

```bash
npm install pue purescript spago
```

## Setup

**vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pue } from 'pue'

export default defineConfig({
  plugins: [pue(), vue()],
})
```

**spago.dhall** (in your project root)

```dhall
{ name = "my-app"
, dependencies = [ "effect", "prelude" ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs" ]
}
```

The plugin automatically adds `.pue/**/*.purs` and pue library sources to your spago config on first build.

## How it works

1. The Vite plugin detects `<script lang="purs">` or `<script setup lang="purs">` blocks
2. PureScript code is extracted to `.pue/` and compiled via `spago build`
3. The `<script>` block is rewritten to import the compiled JavaScript
4. Vue's template bindings work through the `setup` convention

### The `setup` convention

Export a function named `setup` that returns an `Effect` of a record. The record fields become your template bindings:

```purescript
setup :: Effect { count :: Ref Int, increment :: Effect Unit }
```

- **`Ref a`** → Vue's `ref()` — reactive values, auto-unwrapped in templates
- **`Effect Unit`** → `() => void` — event handlers (`@click`, etc.)
- **`Effect a`** → thunks — PureScript's `Effect` compiles to `() => a`, which naturally aligns with Vue's `computed()`, `onMounted()`, etc.

## API

The `Pue` module provides Vue reactivity bindings for PureScript:

```purescript
ref        :: forall a. a -> Effect (Ref a)
readRef    :: forall a. Ref a -> Effect a
writeRef   :: forall a. a -> Ref a -> Effect Unit
modifyRef  :: forall a. (a -> a) -> Ref a -> Effect Unit
computed   :: forall a. Effect a -> Effect (Ref a)
onMounted  :: Effect Unit -> Effect Unit
onUnmounted :: Effect Unit -> Effect Unit
```

## Both APIs

**Composition API** — `<script setup lang="purs">`

Fields from `setup` are destructured directly into the template scope.

**Options API** — `<script lang="purs">`

The module is wrapped as a Vue component options object with a `setup()` method.

## Editor support

- **[Neovim](docs/editor.md#neovim)** — Tree-sitter injection for PureScript highlighting + LSP config
- **[VSCode](docs/editor.md#vscode)** — TextMate grammar injection extension
- **[Volar](docs/editor.md#volar)** — Language plugin for Vue language tools

See [docs/editor.md](docs/editor.md) for setup instructions.

## Documentation

| Topic | Description |
|-------|-------------|
| [Architecture](docs/architecture.md) | How the Vite plugin works internally |
| [Editor support](docs/editor.md) | Neovim, VSCode, Volar setup |
| [API reference](docs/api.md) | PureScript bindings for Vue reactivity |

## License

MIT
