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
import Prelude
import Pue (ref, modifyRef)

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

The plugin automatically adds `.pue/**/*.purs` and pue library sources to your spago config on first build. Module names are derived from file paths (`src/components/Counter.vue` → `App.Components.Counter`).

## How it works

1. The Vite plugin detects `<script lang="purs">` blocks
2. PureScript code is extracted to `.pue/` and compiled via `spago build`
3. The `<script>` block is rewritten to import the compiled JavaScript
4. Vue's template bindings work through the `setup` convention

### The `setup` convention

Export a `setup` function that returns a record. Field names become template bindings — no annotation needed:

```purescript
setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
```

- **`Ref a`** → reactive values, auto-unwrapped in templates
- **`Effect Unit`** → event handlers (`@click`, etc.)
- **`Effect a`** → PureScript's `Effect` compiles to `() => a`, naturally aligning with Vue's deferred-execution APIs

## Ref as Functor / Applicative

`Ref` supports `<$>`, `<*>`, and algebraic operations — derived refs are created as `Vue.computed` automatically:

```purescript
a <- ref 0
b <- ref 0
let total = a + b                -- Semiring: computed(() => a.value + b.value)
let doubled = (_ * 2) <$> count  -- Functor
let combined = lift2 gcd a b     -- Apply
```

### focus — bidirectional Ref map

```purescript
celsius <- ref 20
let fahrenheit = focus (\c -> c * 9 / 5 + 32) (\f -> (f - 32) * 5 / 9) celsius
-- Both celsius and fahrenheit are writable; changes propagate in both directions
```

## Component declarations

Use `DefineComponent` to declare props, emits, model, and other metadata in one place:

```purescript
import Pue (DefineComponent, defineComponent, toRef)

define :: DefineComponent
  ( props :: { msg :: String, count :: Int }
  , emits :: { notify :: Unit }
  )
define = defineComponent

setup p emit = do
  countRef <- toRef @"count" p
  let doubled = (_ * 2) <$> countRef
  let notify  = emit "notify" unit
  pure { doubled, notify }
```

Component options and prop defaults use identity macros:

```purescript
import Pue (defineOptions, defineDefaults)

options = defineOptions { inheritAttrs: false }
defaults = defineDefaults { count: 0 }
```

### Component imports

Use a vanilla `<script>` block for child component imports:

```vue
<script>
import ChildComponent from './ChildComponent.vue'
</script>

<script lang="purs">
import Prelude
import Pue (provide)

setup = do
  provide @"theme" "dark"
  pure {}
</script>
```

See [docs/api.md](docs/api.md) for the full API reference.

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
| [API reference](docs/api.md) | Complete PureScript API for Vue reactivity |
| [Type system](docs/type-system.md) | How Vue's reactivity maps to PureScript's types |
| [Architecture](docs/architecture.md) | How the Vite plugin works internally |
| [Editor support](docs/editor.md) | Neovim, VSCode, Volar setup |

## License

MIT
