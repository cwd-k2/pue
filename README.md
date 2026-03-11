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

## Quick start

```bash
npx pue init my-app
cd my-app
npm install
npm run dev
```

This scaffolds a complete project — `package.json`, `vite.config.ts`, `spago.dhall`, source files, and editor config.

### Adding to an existing project

```bash
npm install pue purescript spago
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

Module names are derived from file paths (`src/components/Counter.vue` → `App.Components.Counter`). Standalone `.purs` files in source directories are also compiled.

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
let doubled = (_ * 2) <$> a      -- Functor
let combined = lift2 gcd a b     -- Apply
```

### focus — bidirectional Ref map

```purescript
celsius <- ref 20
let fahrenheit = focus (\c -> c * 9 / 5 + 32) (\f -> (f - 32) * 5 / 9) celsius
-- Both celsius and fahrenheit are writable; changes propagate in both directions
```

## Component declarations

Declare props and emits as module-level phantom values. The plugin extracts types from externs; `setup` accesses them via visible type applications:

```purescript
import Prelude
import Pue (DefineProps, defineProps, DefineEmits, defineEmits, emit, toRef)

props :: DefineProps { msg :: String, count :: Int }
props = defineProps

emits :: DefineEmits { notify :: Unit }
emits = defineEmits

setup = do
  countRef <- toRef @"count" props
  let doubled = (_ * 2) <$> countRef
  let notify  = emit @"notify" emits unit
  pure { doubled, notify }
```

`DefineComponent` consolidates props, emits, model, expose, and slots into a single declaration when you don't need runtime access to the handles:

```purescript
define :: DefineComponent
  ( props :: { msg :: String, count :: Int }
  , emits :: { notify :: Unit }
  )
define = defineComponent
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

## Compared to Vue JS

pue is not a different framework — it is Vue, with PureScript as the scripting language. Most differences are direct consequences of the type system.

**What improves:**

```purescript
-- Reactive expressions: no .value, no computed(() => ...)
let total = a + b                    -- vs computed(() => a.value + b.value)
let label = show <$> count          -- vs computed(() => `${count.value}`)

-- Pure vs effectful, visible in syntax
let doubled = (_ * 2) <$> count     -- let: pure derivation
count <- ref 0                       -- <-: side effect

-- Type-safe provide/inject without InjectionKey boilerplate
provide @"theme" "dark"
theme <- inject @"theme" (pure "light")

-- Bidirectional refs in one line
let fahrenheit = focus (\c -> c * 9.0 / 5.0 + 32.0) (\f -> (f - 32.0) * 5.0 / 9.0) celsius
```

**What changes:**

```purescript
-- Props: explicit toRef (no proxy mechanism in PureScript)
countRef <- toRef @"count" props     -- vs props.count

-- Emits: phantom handle carries the row constraint
emit @"notify" emits unit            -- vs emit('notify')

-- Ref access: explicit functions instead of .value
modifyRef (_ + 1) count              -- vs count.value++
```

See [docs/comparison.md](docs/comparison.md) for the full comparison.

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
| [Compared to Vue JS](docs/comparison.md) | What improves and what changes vs vanilla Vue |
| [Type system](docs/type-system.md) | How Vue's reactivity maps to PureScript's types |
| [Architecture](docs/architecture.md) | How the Vite plugin works internally |
| [Editor support](docs/editor.md) | Neovim, VSCode, Volar setup |

## License

MIT
