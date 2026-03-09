# API Reference

## Module `Pue`

Vue bindings for PureScript. The API is organized by the type signature pattern each operation follows.

```
Layer 0  Algebra           Ref as Functor / Apply / Applicative + derived instances
Layer 1  Ref Primitives    Construction, read, write of reactive state cells
Layer 2  Subscriptions     Callback registration for reactive, lifecycle, and temporal events
Layer 3  Component Interface  Compile-time declarations (phantom) + runtime context access
```

---

## Layer 0: Algebra

### `Ref :: Type -> Type`

Opaque type wrapping Vue's `ref()` / `computed()`. In templates, Vue auto-unwraps refs.

`Ref` is a `Functor`, `Apply`, and `Applicative`. Every algebraic operation creates a `Vue.computed` — a node in the reactive dependency graph.

### Functor / Apply / Applicative

```purescript
instance Functor Ref       -- map f ref      → computed(() => f(ref.value))
instance Apply Ref         -- apply fRef aRef → computed(() => fRef.value(aRef.value))
instance Applicative Ref   -- pure val        → computed(() => val)
```

These eliminate `computed do readRef ... pure ...` patterns:

```purescript
-- Before                              -- After
doubled <- computed do                 let doubled = (_ * 2) <$> count
  c <- readRef count
  pure (c * 2)

combined <- computed do                let combined = (\t c -> t <> ": " <> c)
  t <- readRef titleRef                                <$> titleRef <*> contentRef
  c <- readRef contentRef
  pure (t <> ": " <> c)
```

### Derived Instances

All derived from `Applicative` via `lift2`:

```purescript
instance Semigroup a      => Semigroup (Ref a)       -- lift2 append
instance Monoid a         => Monoid (Ref a)           -- pure mempty
instance Semiring a       => Semiring (Ref a)         -- lift2 add/mul, pure zero/one
instance Ring a           => Ring (Ref a)             -- lift2 sub
instance HeytingAlgebra a => HeytingAlgebra (Ref a)   -- lift2 conj/disj, map not
instance BooleanAlgebra a => BooleanAlgebra (Ref a)
```

```purescript
a <- ref 0
b <- ref 0
let total = a + b    -- Semiring: computed(() => a.value + b.value)
```

---

## Layer 1: Ref Primitives

Effectful operations on reactive state cells, classified by verb.

### Construction: `... -> Effect (Ref a)`

#### `ref :: forall a. a -> Effect (Ref a)`

Create a mutable reactive reference.

```purescript
count <- ref 0
```

#### `shallowRef :: forall a. a -> Effect (Ref a)`

Create a ref that only tracks `.value` replacement, not deep changes.

#### `computed :: forall a. Effect a -> Effect (Ref a)`

Create a computed ref. Prefer `<$>` and `<*>` from Layer 0 for pure derivations. Use `computed` only when the derivation involves side effects.

```purescript
result <- computed do
  c <- readRef count
  log ("computing: " <> show c)
  pure (c * 2)
```

#### `customRef :: forall a. (Effect Unit -> Effect Unit -> { get :: Effect a, set :: a -> Effect Unit }) -> Effect (Ref a)`

Create a ref with explicit control over dependency tracking and update triggering.

```purescript
debounced <- customRef \track trigger -> { get: track *> readRef value, set: \v -> writeRef v value *> delay 300 trigger }
```

The factory receives `track` and `trigger` callbacks and returns `{ get, set }` accessors.

#### `toRef :: forall props a. props -> String -> Effect (Ref a)`

Create a reactive ref linked to a property of a reactive object (typically props).

```purescript
setup p emit = do
  countRef <- toRef p "count"
  let doubled = (_ * 2) <$> countRef
```

**Why `toRef`?** Direct prop access `p.count` is eagerly evaluated in PureScript — the value is captured at setup time. `toRef` creates a `Ref` that preserves Vue's dependency tracking.

#### `useTemplateRef :: forall a. String -> Effect (Ref a)`

Create a ref bound to a template `ref="..."` attribute.

```purescript
inputEl <- useTemplateRef "inputEl"
```

#### `useModel :: forall props a. props -> String -> Effect (Ref a)`

Create a writable ref bound to a `v-model` prop. Reads from the prop and emits `update:<name>` on write.

```purescript
setup p = do
  titleRef <- useModel p "title"
```

### Read: `Ref a -> Effect a`

#### `readRef :: forall a. Ref a -> Effect a`

Read the current value. Use inside `computed` or `watchEffect` to establish reactive dependencies.

### Write: `... -> Ref a -> Effect Unit`

#### `writeRef :: forall a. a -> Ref a -> Effect Unit`

Replace the value.

#### `modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit`

Transform the current value.

```purescript
modifyRef (_ + 1) count
```

#### `triggerRef :: forall a. Ref a -> Effect Unit`

Force a trigger on a `shallowRef`. Use when the inner value is mutated without replacing it.

```purescript
triggerRef myShallowRef
```

---

## Layer 2: Subscriptions

Callback registration for events. All functions take a callback and register it to be executed at a specific point. Common pattern: `handler -> Effect Unit`.

### Reactive Observation

#### `watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit`

Watch a ref and run a callback on change.

```purescript
watch count \newVal oldVal ->
  modifyRef (\xs -> xs <> [show oldVal <> " → " <> show newVal]) history
```

#### `watchEffect :: Effect Unit -> Effect Unit`

Run an effect that auto-tracks reactive dependencies and re-runs on change.

```purescript
watchEffect do
  c <- readRef count
  writeRef (if mod c 2 == 0 then "even" else "odd") parity
```

#### `watchPostEffect :: Effect Unit -> Effect Unit`

Like `watchEffect`, but deferred until after DOM updates. Use when the effect needs to read updated DOM state.

#### `watchSyncEffect :: Effect Unit -> Effect Unit`

Like `watchEffect`, but runs synchronously on every reactive change. Use sparingly — typically for debuggers or low-level state synchronization.

### Lifecycle: Component State Machine Transitions

```purescript
onBeforeMount   :: Effect Unit -> Effect Unit   -- before initial mount
onMounted       :: Effect Unit -> Effect Unit   -- after mounted to DOM
onBeforeUpdate  :: Effect Unit -> Effect Unit   -- before reactive re-render
onUpdated       :: Effect Unit -> Effect Unit   -- after re-render
onBeforeUnmount :: Effect Unit -> Effect Unit   -- before teardown
onUnmounted     :: Effect Unit -> Effect Unit   -- after teardown
onActivated     :: Effect Unit -> Effect Unit   -- KeepAlive: re-activated
onDeactivated   :: Effect Unit -> Effect Unit   -- KeepAlive: deactivated
```

```purescript
onMounted do
  writeRef true isMounted
```

#### `onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit`

Register a handler for errors from child components. Return `true` to prevent propagation.

```purescript
onErrorCaptured \err -> do
  writeRef "Error caught" errorMsg
  pure true
```

### Temporal: Deferred Execution

#### `nextTick :: Effect Unit -> Effect Unit`

Register an effect to run after the next DOM update cycle.

### Scope: Subscription Lifetime Management

#### `EffectScope :: Type`

Opaque handle for a reactive effect scope.

#### `effectScope :: Effect EffectScope`

Create a new effect scope. All reactive effects registered inside `runScope` are collected and can be stopped together.

#### `runScope :: forall a. EffectScope -> Effect a -> Effect a`

Run an effect inside a scope. Watchers and computed refs created during execution belong to the scope.

#### `stopScope :: EffectScope -> Effect Unit`

Stop all effects in a scope.

#### `onScopeDispose :: Effect Unit -> Effect Unit`

Register a cleanup callback on the current active scope.

```purescript
scope <- effectScope
runScope scope do
  watchEffect do
    c <- readRef count
    log (show c)
  onScopeDispose do
    log "scope disposed"
-- later:
stopScope scope
```

---

## Layer 3: Component Interface

### Declarations (Phantom Types)

The plugin reads type annotations at compile time to generate Vue component options. Runtime values are `null`.

#### DefineProps

```purescript
props :: DefineProps { msg :: String, count :: Int }
props = defineProps
```

Generates `props: { msg: { type: String }, count: { type: Number } }`.

Type mapping: `String` → `String`, `Int`/`Number` → `Number`, `Boolean` → `Boolean`.

#### DefineEmits

```purescript
emits :: DefineEmits { notify :: Unit }
emits = defineEmits
```

Generates `emits: ["notify"]`.

#### DefineModel

```purescript
model :: DefineModel { title :: String, content :: String }
model = defineModel
```

Generates props for each field + `emits: ["update:title", "update:content"]` for Vue 3 named `v-model`.

#### DefineExpose

```purescript
expose :: DefineExpose { count :: Ref Int, increment :: Effect Unit }
expose = defineExpose
```

Options API: generates `expose: ["count", "increment"]`.
Setup SFC: generates `defineExpose({ count, increment })`.

#### DefineSlots

```purescript
slots :: DefineSlots { title :: {}, footer :: {} }
slots = defineSlots
```

Declares named slot types for documentation and tooling.

#### Defaults (record literal)

```purescript
props :: DefineProps { msg :: String, count :: Int }
props = defineProps

defaults = { count: 0 }
```

Default values are merged into the generated prop definitions:
`props: { msg: { type: String }, count: { type: Number, default: 0 } }`.

#### DefineOptions (record literal)

```purescript
options = { inheritAttrs: false }
```

Merged directly into component options.

### Context: Component Environment

#### `provide :: forall a. String -> a -> Effect Unit`

Provide a value to descendant components.

#### `inject :: forall a. String -> a -> Effect a`

Inject a value provided by an ancestor. Returns the default if not provided.

```purescript
-- Parent
provide "theme" "dark"

-- Descendant
theme <- inject "theme" "default"
```

#### `useSlots :: forall a. Effect a`

Access the slots object.

#### `useAttrs :: forall a. Effect a`

Access the attrs object (fallthrough attributes).

#### `useId :: Effect String`

Generate a unique ID for accessibility.

```purescript
uid <- useId
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
