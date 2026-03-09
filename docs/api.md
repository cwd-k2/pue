# API Reference

## Module `Pue`

Vue bindings for PureScript, organized in four layers.

```
Layer 0  Algebraic Core       Ref as Functor / Apply / Applicative + derived instances
Layer 1  Effect Operations    Creation, mutation, observation, lifecycle
Layer 2  Component Interface  DefineX phantom type macros
Layer 3  Runtime Utilities    Vue composable FFI
```

---

## Layer 0: Algebraic Core

### `Ref :: Type -> Type`

Opaque type wrapping Vue's `ref()` / `computed()`. In templates, Vue auto-unwraps refs.

`Ref` is a `Functor`, `Apply`, and `Applicative` — derived refs are created via `Vue.computed`.

### Functor / Apply / Applicative

```purescript
instance Functor Ref       -- map f ref → computed(() => f(ref.value))
instance Apply Ref         -- apply fRef aRef → computed(() => fRef.value(aRef.value))
instance Applicative Ref   -- pure val → computed(() => val)
```

This eliminates `computed do readRef ... pure ...` patterns entirely:

```purescript
-- Before
doubled <- computed do
  c <- readRef count
  pure (c * 2)

-- After
let doubled = (_ * 2) <$> count
```

Multi-ref dependencies use `<*>`:

```purescript
-- Before
combined <- computed do
  t <- readRef titleRef
  c <- readRef contentRef
  pure (t <> ": " <> c)

-- After
let combined = (\t c -> t <> ": " <> c) <$> titleRef <*> contentRef
```

### Derived Instances

All instances are derived from `Applicative` via `lift2`:

```purescript
instance Semigroup a => Semigroup (Ref a)      -- lift2 append
instance Monoid a => Monoid (Ref a)            -- pure mempty
instance Semiring a => Semiring (Ref a)        -- lift2 add/mul, pure zero/one
instance Ring a => Ring (Ref a)                -- lift2 sub
instance HeytingAlgebra a => HeytingAlgebra (Ref a)
instance BooleanAlgebra a => BooleanAlgebra (Ref a)
```

Arithmetic on refs works directly:

```purescript
a <- ref 0
b <- ref 0
let total = a + b    -- Semiring: computed(() => a.value + b.value)
```

---

## Layer 1: Effect Operations

### Ref Creation

#### `ref :: forall a. a -> Effect (Ref a)`

Create a mutable reactive reference.

```purescript
count <- ref 0
```

#### `shallowRef :: forall a. a -> Effect (Ref a)`

Create a ref that only tracks `.value` replacement, not deep changes.

#### `toRef :: forall props a. props -> String -> Effect (Ref a)`

Create a reactive ref linked to a property of a reactive object (typically props).

```purescript
setup p emit = do
  countRef <- toRef p "count"
  let doubled = (_ * 2) <$> countRef
```

**Why `toRef`?** Direct prop access `p.count` is eagerly evaluated in PureScript. `toRef` creates a `Ref` that preserves Vue's dependency tracking.

### Ref Mutation

#### `readRef :: forall a. Ref a -> Effect a`

Read the current value. Use inside `computed` or `watchEffect` to establish dependencies.

#### `writeRef :: forall a. a -> Ref a -> Effect Unit`

Replace the value.

#### `modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit`

Transform the current value.

```purescript
modifyRef (_ + 1) count
```

### Computed

#### `computed :: forall a. Effect a -> Effect (Ref a)`

Create a computed ref. Prefer `<$>` and `<*>` from Layer 0 when possible.

```purescript
-- Use computed only when Effect operations (side effects) are needed
result <- computed do
  c <- readRef count
  log ("Computing for " <> show c)
  pure (c * 2)
```

### Watchers

#### `watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit`

Watch a ref and run a callback on change.

```purescript
watch count \newVal oldVal ->
  modifyRef (\xs -> xs <> [show oldVal <> " → " <> show newVal]) history
```

#### `watchEffect :: Effect Unit -> Effect Unit`

Run an effect that auto-tracks dependencies and re-runs on change.

```purescript
watchEffect do
  c <- readRef count
  writeRef (if mod c 2 == 0 then "even" else "odd") parity
```

### Lifecycle Hooks

```purescript
onBeforeMount  :: Effect Unit -> Effect Unit
onMounted      :: Effect Unit -> Effect Unit
onBeforeUpdate :: Effect Unit -> Effect Unit
onUpdated      :: Effect Unit -> Effect Unit
onBeforeUnmount :: Effect Unit -> Effect Unit
onUnmounted    :: Effect Unit -> Effect Unit
onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit
```

```purescript
onMounted do
  writeRef true mounted

onErrorCaptured \err -> do
  writeRef "Error caught" errorMsg
  pure true  -- true = prevent propagation
```

### Dependency Injection

#### `provide :: forall a. String -> a -> Effect Unit`

#### `inject :: forall a. String -> a -> Effect a`

```purescript
-- Parent
provide "theme" "dark"

-- Descendant
theme <- inject "theme" "default"
```

### Async

#### `nextTick :: Effect Unit -> Effect Unit`

Run a callback after the next DOM update cycle.

---

## Layer 2: Component Interface

Phantom type macros — the plugin reads type annotations to generate Vue component options. Runtime values are `null`.

### DefineProps

```purescript
props :: DefineProps { msg :: String, count :: Int }
props = defineProps
```

Generates `props: { msg: { type: String }, count: { type: Number } }`.

Type mapping: `String` → `String`, `Int`/`Number` → `Number`, `Boolean` → `Boolean`.

### DefineEmits

```purescript
emits :: DefineEmits { notify :: Unit }
emits = defineEmits
```

Generates `emits: ["notify"]`.

### DefineModel

```purescript
model :: DefineModel { title :: String, content :: String }
model = defineModel
```

Generates props for each field + `emits: ["update:title", "update:content"]`. Supports Vue 3 named `v-model`:

```vue
<MultiModelChild v-model:title="title" v-model:content="content" />
```

### DefineExpose

```purescript
expose :: DefineExpose { count :: Ref Int, increment :: Effect Unit }
expose = defineExpose
```

Options API: generates `expose: ["count", "increment"]`.
Setup SFC: generates `defineExpose({ count, increment })`.

### DefineSlots

```purescript
slots :: DefineSlots { title :: {}, footer :: {} }
slots = defineSlots
```

Declares named slot types for documentation and tooling.

### DefineOptions (record literal)

```purescript
options = { inheritAttrs: false }
```

Merged directly into component options.

---

## Layer 3: Runtime Utilities

### `useTemplateRef :: forall a. String -> Effect (Ref a)`

```purescript
inputEl <- useTemplateRef "inputEl"
```

Returns a ref bound to a template `ref="inputEl"` attribute.

### `useSlots :: forall a. Effect a`

Access the slots object.

### `useAttrs :: forall a. Effect a`

Access the attrs object (fallthrough attributes).

### `useId :: Effect String`

Generate a unique ID for accessibility.

```purescript
uid <- useId
-- use in template: <label :for="uid">
```

---

## The `setup` Convention

Export a `setup` function returning a record via `pure { ... }`. Field names are extracted automatically:

```purescript
setup = do
  count <- ref 0
  let doubled = (_ * 2) <$> count
  let increment = modifyRef (_ + 1) count
  pure { count, doubled, increment }
```

| Field type | Template usage |
|---|---|
| `Ref a` | Reactive value, auto-unwrapped: `{{ field }}` |
| `Effect Unit` | Event handler: `@click="field"` |
| `String`, `Int`, etc. | Static value: `{{ field }}` |

### Setup with props/emits

```purescript
setup p emit = do
  countRef <- toRef p "count"
  let doubled = (_ * 2) <$> countRef
  let notify = emit "notify" unit
  pure { doubled, notify }
```

The plugin detects argument count and generates the appropriate bridge:
- `setup` → `setup() { return __pue_setup() }`
- `setup p` → `setup(__props) { return __pue_setup(__props)() }`
- `setup p emit` → `setup(__props, { emit }) { return __pue_setup(__props)(emitWrapper)() }`

## Pure Exports

Modules without `setup` export values directly:

```purescript
module App.Constants where

message :: String
message = "Hello from PureScript"
```
