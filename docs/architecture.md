# Architecture

## Pipeline overview

```
.vue file (lang="purs")
  │
  ├─ extract ──→ .pue/<Module>/<Name>.purs
  │
  ├─ spago build ──→ output/<Module.Name>/index.js
  │
  └─ transform ──→ <script setup> with JS imports
        │
        └─ @vitejs/plugin-vue takes over
```

pue runs as a Vite plugin with `enforce: 'pre'`, executing before `@vitejs/plugin-vue`. This lets it rewrite PureScript blocks into standard JavaScript before Vue's compiler sees them.

## Plugin lifecycle

### `buildStart`

1. **`ensureSpagoSources()`** — Patches `spago.dhall` to include `.pue/**/*.purs` and the pue library's PureScript sources. Runs once.
2. **`scanAndExtract()`** — Walks `src/` for `.vue` files containing `lang="purs"`, extracts PureScript code to `.pue/` organized by module hierarchy.
3. **`compile()`** — Runs `spago build`. All modules compile in a single pass.

### `transform(code, id)`

Called by Vite for each `.vue` file. For files with PureScript blocks:

1. **`extract()`** — Finds the `<script lang="purs">` tag, determines if it's `setup` or options style.
2. **`getExports()`** — Reads the compiled `output/<Module>/index.js` to discover exported symbols.
3. **`extractRecordFields()`** — Parses the PureScript source for the `setup` function's return type to identify record fields.
4. **`transformSetupSFC()` / `transformOptionsSFC()`** — Rewrites the `<script>` block with appropriate JS imports and destructuring.

### `handleHotUpdate`

On file change during dev:

1. Re-extract PureScript code
2. Recompile via `spago build`
3. Vite's HMR picks up the changed compiled output

### `config`

Adds an esbuild plugin to handle Vite's dependency pre-bundling phase. PureScript SFC files are returned as empty JS modules during dep scanning to prevent esbuild from trying to parse PureScript syntax.

## File layout

```
project/
├── .pue/              ← extracted PureScript (generated, gitignored)
│   └── Module/
│       └── Name.purs
├── output/            ← PureScript compiler output (generated)
│   └── Module.Name/
│       └── index.js
├── spago.dhall        ← PureScript package config
└── src/
    └── *.vue          ← your components
```

## Transform examples

### Composition API (`<script setup lang="purs">`)

Given a PureScript module exporting `setup :: Effect { count :: Ref Int, increment :: Effect Unit }`, the transform produces:

```js
import { setup as __pue_setup } from '/abs/path/output/Module.Name/index.js'
const { count, increment } = __pue_setup()
```

If the module also has top-level exports (not in the setup record), they're imported as named imports alongside.

### Options API (`<script lang="purs">`)

Wrapped as a component options object:

```js
import { setup as __pue_setup } from '/abs/path/output/Module.Name/index.js'
export default { setup() { return __pue_setup() } }
```

## Why `Effect` aligns with Vue

PureScript's `Effect a` compiles to `() => a`. This is the exact shape Vue expects:

| PureScript | Compiled JS | Vue usage |
|---|---|---|
| `ref 0 :: Effect (Ref Int)` | `() => Vue.ref(0)` | Creates reactive ref |
| `computed getter :: Effect (Ref a)` | `() => Vue.computed(getter)` | `getter` is itself `() => a` |
| `onMounted cb :: Effect Unit` | `() => Vue.onMounted(cb)` | `cb` is `() => void` |
| `modifyRef f r :: Effect Unit` | `() => { r.value = f(r.value) }` | Event handler |

The `setup` function returns `Effect { ... }`, which compiles to `() => { ... }`. Calling it (`__pue_setup()`) runs all the effectful initialization and returns the record of bindings — exactly what Vue's `setup()` function expects.
