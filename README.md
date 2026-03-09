# pue

Write PureScript in Vue Single File Components.

```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script lang="purs">
module App.Counter where

import Prelude
import Pue (Ref, ref, modifyRef)

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
```

PureScript's type system and algebraic structures meet Vue's reactivity. No code generation, no separate files — just `lang="purs"` in your `<script>` block.

## Install

```bash
npm install pue purescript spago
```

## Quick start

```bash
npx pue init          # creates spago.dhall, packages.dhall, .gitignore
```

**vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pue } from 'pue'

export default defineConfig({
  plugins: [pue(), vue()],
})
```

The plugin automatically adds `.pue/**/*.purs` and pue library sources to your spago config on first build.

## How it works

1. The Vite plugin detects `<script lang="purs">` blocks
2. PureScript code is extracted to `.pue/` and compiled via `spago build`
3. The `<script>` block is rewritten to import the compiled JavaScript
4. Vue's template bindings work through the `setup` convention

### The `setup` convention

Export a `setup` function that returns a record via `pure { ... }`. Field names are extracted automatically — no type annotation needed:

```purescript
setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
```

- **`Ref a`** → Vue's `ref()` — reactive values, auto-unwrapped in templates
- **`Effect Unit`** → `() => void` — event handlers (`@click`, etc.)
- **`Effect a`** → PureScript's `Effect` compiles to `() => a`, naturally aligning with Vue's `computed()`, `onMounted()`, etc.

## API

The `Pue` module is organized in four layers, classified by type signature pattern:

```
Layer 0  Algebra              Ref as Functor / Apply / Applicative + derived instances
Layer 1  Ref Primitives       Construction, read, write of reactive state cells
Layer 2  Subscriptions        Callback registration for reactive, lifecycle, temporal events
Layer 3  Component Interface  Compile-time declarations (phantom) + runtime context
```

### Ref as Functor / Applicative

`Ref` supports `<$>` and `<*>` — derived refs are created as `Vue.computed` automatically:

```purescript
a <- ref 0
b <- ref 0
let total = a + b                -- Semiring: computed(() => a.value + b.value)
let doubled = (_ * 2) <$> count  -- Functor: computed(() => count.value * 2)
let combined = (\x y -> x <> ": " <> y) <$> title <*> content  -- Apply
```

### Component Interface

```purescript
props :: DefineProps { msg :: String, count :: Int }
props = defineProps

emits :: DefineEmits { notify :: Unit }
emits = defineEmits

model :: DefineModel { title :: String, content :: String }
model = defineModel
```

See [docs/api.md](docs/api.md) for full reference.

## Usage

`<script lang="purs">` — The module is wrapped as a Vue component options object with a `setup()` method. Modules without `setup` export all bindings directly through a generated `setup()` wrapper.

## Editor support

```bash
npx pue editor neovim   # tree-sitter injection + LSP instructions
npx pue editor vscode   # syntax extension
npx pue editor volar    # Volar integration
```

See [docs/editor.md](docs/editor.md) for details.

## Documentation

| Topic | Description |
|-------|-------------|
| [Architecture](docs/architecture.md) | How the Vite plugin works internally |
| [Editor support](docs/editor.md) | Neovim, VSCode, Volar setup |
| [API reference](docs/api.md) | PureScript bindings for Vue reactivity |

## License

MIT
