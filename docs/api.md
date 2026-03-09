# API Reference

## Module `Pue`

Vue reactivity bindings for PureScript. Import in your `<script lang="purs">` blocks.

```purescript
import Pue (Ref, ref, readRef, writeRef, modifyRef, computed, onMounted, onUnmounted)
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

Read the current value of a ref. Use inside `computed` or other effects to establish reactive dependencies.

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

### Computed

#### `computed :: forall a. Effect a -> Effect (Ref a)`

Create a computed ref that automatically tracks reactive dependencies.

```purescript
doubled <- computed do
  c <- readRef count
  pure (c * 2)
```

The getter (the `Effect a` argument) is called by Vue's reactivity system whenever its dependencies change. Reading a `Ref` inside the getter establishes a dependency.

### Lifecycle

#### `onMounted :: Effect Unit -> Effect Unit`

Register a callback to run after the component is mounted to the DOM.

```purescript
onMounted do
  log "Component mounted"
```

#### `onUnmounted :: Effect Unit -> Effect Unit`

Register a cleanup callback for when the component is removed.

```purescript
onUnmounted do
  log "Component destroyed"
```

## The `setup` convention

To expose bindings to Vue templates, export a `setup` function returning a record wrapped in `Effect`:

```purescript
setup :: Effect { fieldName :: FieldType, ... }
setup = do
  -- initialization
  pure { fieldName: value, ... }
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
