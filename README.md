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
import Pue (Ref, ref, modifyRef)

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

1. The Vite plugin detects `<script lang="purs">` or `<script setup lang="purs">` blocks
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

The `Pue` module provides Vue bindings for PureScript:

```purescript
-- Reactivity
ref         :: forall a. a -> Effect (Ref a)
readRef     :: forall a. Ref a -> Effect a
writeRef    :: forall a. a -> Ref a -> Effect Unit
modifyRef   :: forall a. (a -> a) -> Ref a -> Effect Unit
computed    :: forall a. Effect a -> Effect (Ref a)
shallowRef  :: forall a. a -> Effect (Ref a)

-- Watchers
watch       :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit
watchEffect :: Effect Unit -> Effect Unit

-- Lifecycle
onBeforeMount, onMounted, onBeforeUpdate, onUpdated,
onBeforeUnmount, onUnmounted :: Effect Unit -> Effect Unit

-- Dependency injection
provide     :: forall a. String -> a -> Effect Unit
inject      :: forall a. String -> a -> Effect a

-- Async
nextTick    :: Effect Unit -> Effect Unit
```

See [docs/api.md](docs/api.md) for full reference.

## Both APIs

**Composition API** — `<script setup lang="purs">`

Fields from `setup` are destructured directly into the template scope.

**Options API** — `<script lang="purs">`

The module is wrapped as a Vue component options object with a `setup()` method.

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
