# API Reference

## Module `Pue`

Vue bindings for PureScript. The API is organized by the type signature pattern each operation follows.

```
Layer 0  Algebra              Ref as Functor / Apply / Applicative + derived instances
Layer 1  Ref Primitives       Construction, read, write of reactive state cells
Layer 2  Subscriptions        Callback registration for reactive, lifecycle, and temporal events
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

combined <- computed do                let combined = lift2 (\t c -> t <> ": " <> c)
  t <- readRef titleRef                                    titleRef contentRef
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
instance CommutativeRing a => CommutativeRing (Ref a)
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

Create a deep-reactive mutable ref.

```purescript
count <- ref 0
```

#### `shallowRef :: forall a. a -> Effect (Ref a)`

Create a ref that only tracks `.value` replacement, not deep changes.

#### `computed :: forall a. Effect a -> Effect (Ref a)`

Create a read-only computed ref. Prefer `<$>` and `<*>` from Layer 0 for pure derivations. Use `computed` only when the derivation involves side effects.

```purescript
result <- computed do
  c <- readRef count
  log ("computing: " <> show c)
  pure (c * 2)
```

#### `customRef :: forall a. (Effect Unit -> Effect Unit -> { get :: Effect a, set :: a -> Effect Unit }) -> Effect (Ref a)`

Create a ref with explicit control over dependency tracking and update triggering.

The factory receives `track` and `trigger` callbacks and returns `{ get, set }` accessors.

### Combinators: `... -> Ref a -> Ref b`

#### `focus :: forall a b. (a -> b) -> (b -> a) -> Ref a -> Ref b`

Bidirectional map — a pure Ref-to-Ref lens combinator. Creates a writable computed ref where reads go through the first function and writes go through the second (inverse) function.

```purescript
celsius <- ref 20
let fahrenheit = focus (\c -> c * 9 / 5 + 32)
                       (\f -> (f - 32) * 5 / 9)
                       celsius

-- Writing to fahrenheit updates celsius via the inverse
modifyRef (_ + 9) fahrenheit
```

Unlike `computed`, `focus` is pure (no `Effect`) and produces a writable ref.

#### `readonly :: forall a. Ref a -> Ref a`

Create a read-only view of a ref. Writes to the returned ref are silently ignored.

### Context-aware construction

#### `toRef :: forall @key r a rest. IsSymbol key => Cons key a rest r => Record r -> Effect (Ref a)`

Create a reactive ref linked to a property of a reactive object (typically props). The key is specified as a type-level symbol.

```purescript
setup p emit = do
  countRef <- toRef @"count" p
  let doubled = (_ * 2) <$> countRef
```

**Why `toRef`?** Direct prop access `p.count` is eagerly evaluated in PureScript — the value is captured at setup time. `toRef` creates a `Ref` that preserves Vue's dependency tracking.

#### `useTemplateRef :: forall a. String -> Effect (Ref a)`

Create a ref bound to a template `ref="..."` attribute. The ref is `null` until mount.

```purescript
inputEl <- useTemplateRef "inputEl"
```

#### `useModel :: forall @key r a rest. IsSymbol key => Cons key a rest r => Record r -> Effect (Ref a)`

Create a writable ref synced with a `v-model` prop. Reads from the prop and emits `update:<name>` on write.

```purescript
setup p = do
  titleRef <- useModel @"title" p
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
modifyRef not visible
```

#### `triggerRef :: forall a. Ref a -> Effect Unit`

Force a reactivity notification on a `shallowRef`. Use when the inner value is mutated without replacing it.

---

## Layer 2: Subscriptions

Callback registration for events. Reactive observation functions return a stop handle (`Effect (Effect Unit)`). Lifecycle and temporal hooks return `Effect Unit`.

### Reactive Observation

All watch functions return a **stop handle** — call it to unregister the watcher.

#### `watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)`

Watch a ref and run a callback on change.

```purescript
_ <- watch count \newVal oldVal ->
  modifyRef (\xs -> xs <> [show oldVal <> " → " <> show newVal]) history
```

**Multi-source watch** is achieved via `Applicative`:

```purescript
let combined = Tuple <$> refA <*> refB
_ <- watch combined \(Tuple a b) _ -> ...
```

#### `watchImmediate :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)`

Like `watch`, but fires the callback immediately with the current value.

#### `watchOnce :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)`

Watch that fires exactly once, then automatically stops.

#### `watchWith :: forall a. Ref a -> (a -> a -> (Effect Unit -> Effect Unit) -> Effect Unit) -> Effect (Effect Unit)`

Watch with cleanup registration. The callback receives `new`, `old`, and an `onCleanup` function. The registered cleanup runs before each re-invocation and on stop.

```purescript
stop <- watchWith query \q _ onCleanup -> do
  cancel <- fetchResults q
  onCleanup cancel
```

#### `watchEffect :: Effect Unit -> Effect (Effect Unit)`

Run an effect that auto-tracks reactive dependencies and re-runs on change.

```purescript
stop <- watchEffect do
  c <- readRef count
  writeRef (if mod c 2 == 0 then "even" else "odd") parity
```

#### `watchPostEffect :: Effect Unit -> Effect (Effect Unit)`

Like `watchEffect`, but deferred until after DOM updates.

#### `watchSyncEffect :: Effect Unit -> Effect (Effect Unit)`

Like `watchEffect`, but runs synchronously on every reactive change. Use sparingly.

### Lifecycle

```purescript
onBeforeMount   :: Effect Unit -> Effect Unit
onMounted       :: Effect Unit -> Effect Unit
onBeforeUpdate  :: Effect Unit -> Effect Unit
onUpdated       :: Effect Unit -> Effect Unit
onBeforeUnmount :: Effect Unit -> Effect Unit
onUnmounted     :: Effect Unit -> Effect Unit
onActivated     :: Effect Unit -> Effect Unit   -- KeepAlive
onDeactivated   :: Effect Unit -> Effect Unit   -- KeepAlive
```

```purescript
onMounted do
  writeRef true isMounted
```

#### `onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit`

Register a handler for errors from child components. Return `true` to prevent propagation.

### Temporal

#### `nextTick :: Effect Unit -> Effect Unit`

Defer a callback to the next DOM update flush.

### Scope

#### `EffectScope :: Type`

Opaque handle for a reactive effect scope.

#### `effectScope :: Effect EffectScope`

Create a new scope.

#### `runScope :: forall a. EffectScope -> Effect a -> Effect a`

Run an effect inside a scope. Watchers and computed refs created during execution belong to the scope.

#### `stopScope :: EffectScope -> Effect Unit`

Stop all effects in a scope.

#### `onScopeDispose :: Effect Unit -> Effect Unit`

Register a cleanup callback on the current active scope.

```purescript
scope <- effectScope
runScope scope do
  _ <- watchEffect do
    c <- readRef count
    log (show c)
  onScopeDispose (log "scope disposed")
stopScope scope
```

---

## Layer 3: Component Interface

### DefineComponent (consolidated)

Declare all component metadata in a single row-typed declaration:

```purescript
import Pue (DefineComponent, defineComponent, toRef)

define :: DefineComponent
  ( props :: { msg :: String, count :: Int }
  , emits :: { notify :: Unit }
  , model :: { title :: String }
  )
define = defineComponent
```

The plugin reads the row fields from compiled externs and generates the appropriate Vue component options. Supported fields: `props`, `emits`, `model`, `expose`, `slots`.

### Individual declarations

For simpler cases, individual phantom types are available:

```purescript
props :: DefineProps { msg :: String, count :: Int }
props = defineProps

emits :: DefineEmits { notify :: Unit }
emits = defineEmits

model :: DefineModel { title :: String, content :: String }
model = defineModel

expose :: DefineExpose { count :: Ref Int, increment :: Effect Unit }
expose = defineExpose

slots :: DefineSlots { title :: {}, footer :: {} }
slots = defineSlots
```

Type mapping: `String` → `String`, `Int`/`Number` → `Number`, `Boolean` → `Boolean`, `Array _` → `Array`, `Effect _` → `Function`.

### Runtime declarations

#### `defineOptions :: forall r. { | r } -> { | r }`

Declare Vue component options. Identity at runtime — the plugin extracts the record value.

```purescript
options = defineOptions { inheritAttrs: false }
```

#### `defineDefaults :: forall r. { | r } -> { | r }`

Declare default values for props. Merged into generated prop definitions.

```purescript
defaults = defineDefaults { count: 0, label: "untitled" }
```

### Context

#### `provide :: forall @key a. IsSymbol key => a -> Effect Unit`

Provide a value to descendant components under a type-level key.

```purescript
provide @"theme" "dark"
```

#### `inject :: forall @key a. IsSymbol key => a -> Effect a`

Inject a value provided by an ancestor, with a default fallback.

```purescript
theme <- inject @"theme" "light"
```

#### `useSlots :: forall a. Effect a`

Access the slots object.

#### `useAttrs :: forall a. Effect a`

Access fallthrough attributes.

#### `useId :: Effect String`

Generate a unique ID for accessibility attributes.

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
  countRef <- toRef @"count" p
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
message = "Hello from PureScript"

greeting name = "Hello, " <> name <> "!"
```
