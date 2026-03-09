# API Reference

## Module `Pue`

Vue reactivity bindings for PureScript. Import in your `<script lang="purs">` blocks.

```purescript
import Pue
  ( Ref, ref, readRef, writeRef, modifyRef
  , computed, watch, watchEffect
  , onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted
  , provide, inject, nextTick, shallowRef, toRef
  )
```

### Types

#### `Ref :: Type -> Type`

Opaque type wrapping Vue's `ref()`. Holds a reactive value.

In templates, Vue auto-unwraps refs — `{{ count }}` displays the value, not the ref object.

### Ref operations

#### `ref :: forall a. a -> Effect (Ref a)`

Create a reactive reference with an initial value.

```purescript
count <- ref 0
name  <- ref "hello"
```

#### `readRef :: forall a. Ref a -> Effect a`

Read the current value of a ref. Use inside `computed` or `watchEffect` to establish reactive dependencies.

```purescript
value <- readRef count
```

#### `writeRef :: forall a. a -> Ref a -> Effect Unit`

Replace the value of a ref.

```purescript
writeRef 0 count  -- reset to 0
```

#### `modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit`

Apply a function to transform the current value.

```purescript
modifyRef (_ + 1) count   -- increment
modifyRef not toggle      -- flip boolean
```

#### `shallowRef :: forall a. a -> Effect (Ref a)`

Create a ref that does not deeply track nested values. Only `.value` replacement triggers reactivity.

#### `toRef :: forall props a. props -> String -> Effect (Ref a)`

Create a reactive ref linked to a property of a reactive object (typically props). Essential for reactive prop access inside `computed` or `watchEffect`.

```purescript
setup p emit = do
  countRef <- toRef p "count"
  doubled <- computed do
    c <- readRef countRef
    pure (c * 2)
  pure { doubled }
```

**Why `toRef`?** Direct prop access like `p.count` in PureScript is eagerly evaluated — using it inside `pure (p.count * 2)` captures the value at setup time, not reactively. `toRef` creates a `Ref` that can be read with `readRef` inside an Effect chain, preserving Vue's dependency tracking.

### Computed

#### `computed :: forall a. Effect a -> Effect (Ref a)`

Create a computed ref that automatically tracks reactive dependencies.

```purescript
doubled <- computed do
  c <- readRef count
  pure (c * 2)
```

The getter (the `Effect a` argument) is called by Vue's reactivity system whenever its dependencies change. Reading a `Ref` inside the getter establishes a dependency.

### Watchers

#### `watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit`

Watch a specific ref and run a callback when it changes.

```purescript
watch count \newVal oldVal ->
  modifyRef (\xs -> xs <> [show oldVal <> " → " <> show newVal]) history
```

#### `watchEffect :: Effect Unit -> Effect Unit`

Run an effect that automatically tracks which refs it reads. Re-runs whenever any tracked ref changes.

```purescript
watchEffect do
  c <- readRef count
  writeRef (if mod c 2 == 0 then "even" else "odd") parity
```

### Lifecycle hooks

#### `onBeforeMount :: Effect Unit -> Effect Unit`

Runs before the component is mounted to the DOM.

#### `onMounted :: Effect Unit -> Effect Unit`

Runs after the component is mounted to the DOM.

```purescript
onMounted do
  writeRef true mounted
```

#### `onBeforeUpdate :: Effect Unit -> Effect Unit`

Runs before the component re-renders due to reactive state changes.

#### `onUpdated :: Effect Unit -> Effect Unit`

Runs after the component re-renders.

#### `onBeforeUnmount :: Effect Unit -> Effect Unit`

Runs before the component is removed from the DOM.

#### `onUnmounted :: Effect Unit -> Effect Unit`

Runs after the component is removed from the DOM.

### Dependency injection

#### `provide :: forall a. String -> a -> Effect Unit`

Provide a value to descendant components via a string key.

```purescript
provide "theme" "dark"
```

#### `inject :: forall a. String -> a -> Effect a`

Inject a value provided by an ancestor component. Returns the default if not provided.

```purescript
theme <- inject "theme" "default"
```

### Async

#### `nextTick :: Effect Unit -> Effect Unit`

Run a callback after the next DOM update cycle.

## The `setup` convention

Export a `setup` function that returns a record wrapped in `Effect`. The plugin extracts field names from the `pure { ... }` expression — no type annotation needed:

```purescript
setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
```

**Record field types and their template behavior:**

| Field type | Template usage |
|---|---|
| `Ref a` | Reactive value, auto-unwrapped: `{{ field }}` |
| `Effect Unit` | Event handler: `@click="field"` |
| `String`, `Int`, etc. | Static value: `{{ field }}` |

## Pure exports

Modules without `setup` can export pure values directly:

```purescript
module App.Constants where

message :: String
message = "Hello from PureScript"
```

These are imported as-is into the template scope.
