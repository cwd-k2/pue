# Compared to Vue JS

What changes when you write PureScript instead of JavaScript in a Vue SFC.

## What improves

### Reactive expressions without `.value` or `computed`

Vue JS:

```js
const a = ref(1)
const b = ref(2)
const total = computed(() => a.value + b.value)
const label = computed(() => `Count: ${a.value}`)
const visible = computed(() => isActive.value && !isHidden.value)
```

pue:

```purescript
a <- ref 1
b <- ref 2
let total   = a + b
let label   = (\n -> "Count: " <> show n) <$> a
let visible = isActive && not isHidden
```

`Ref` has `Functor`, `Applicative`, `Semiring`, `Ring`, `HeytingAlgebra`, and other algebraic instances. Every operation lifts through `Vue.computed` automatically. No `.value`, no `computed(() => ...)` wrappers.

In Vue JS, forgetting `.value` is a silent bug — the value is read eagerly and loses reactivity. In pue, `Ref` is opaque: there is no way to accidentally unwrap it.

### Pure vs effectful at a glance

Vue JS:

```js
const count = ref(0)
const doubled = count.value * 2  // BUG: not reactive
const tripled = computed(() => count.value * 3)  // correct
onMounted(() => console.log('mounted'))
```

The distinction between a reactive derivation and an eager evaluation is invisible. You must know to wrap with `computed`.

pue:

```purescript
count <- ref 0
let doubled = (_ * 2) <$> count     -- let: pure derivation
let tripled = (_ * 3) <$> count     -- let: pure derivation
onMounted (log "mounted")           -- do-bind: side effect
```

`let` bindings are pure graph construction. `<-` bindings are effects. The syntax makes the distinction visible, and the compiler enforces it.

### Bidirectional refs

Vue JS:

```js
const celsius = ref(20)
const fahrenheit = computed({
  get: () => celsius.value * 9 / 5 + 32,
  set: (f) => { celsius.value = (f - 32) * 5 / 9 }
})
```

pue:

```purescript
celsius <- ref 20.0
let fahrenheit = focus (_ * 9.0 / 5.0 + 32.0) (\f -> (f - 32.0) * 5.0 / 9.0) celsius
```

`focus` is a lens-like combinator for bidirectional `Ref` transformation. Both refs are writable; changes propagate through the forward and backward functions.

### Type-safe provide / inject

Vue JS:

```ts
provide('theme', 'dark')

// In another component:
const theme = inject('theme')  // type: unknown
```

To get type safety, you need to declare and share an `InjectionKey<T>`:

```ts
// keys.ts
export const themeKey: InjectionKey<string> = Symbol('theme')
// provider
provide(themeKey, 'dark')
// consumer
const theme = inject(themeKey)  // type: string | undefined
```

pue:

```purescript
provide @"theme" "dark"

-- In another component:
theme <- inject @"theme" (pure "light")  -- type: String
```

The key and value type are unified through visible type application. No shared key file, no `InjectionKey` boilerplate, no `undefined` union.

### Phantom types for component metadata

Vue JS `defineProps` looks like a function call but is actually a compiler macro. It cannot appear inside conditionals, be stored in variables, or be called at runtime — but nothing in the syntax signals this:

```js
const props = defineProps({ count: Number })  // looks like a function call
```

pue makes the compile-time / runtime boundary explicit in the type system:

```purescript
props :: DefineProps { count :: Int }
props = defineProps  -- DefineProps is a phantom type (null at runtime)
```

The type `DefineProps { count :: Int }` tells both the developer and the plugin what this value is: compile-time metadata, not a runtime object.

## What changes

### Props access requires `toRef`

Vue JS:

```js
const props = defineProps({ count: Number })
console.log(props.count)  // direct access
```

pue:

```purescript
props :: DefineProps { count :: Int }
props = defineProps
countRef <- toRef @"count" props  -- explicit reactive binding
```

This is a consequence of Vue's reactivity model. In JS, `props` is a reactive proxy — reading `props.count` establishes a dependency through the proxy trap. PureScript has no proxy mechanism, so `toRef` explicitly creates a `Ref` that tracks the prop.

### Emits carry a phantom handle

Vue JS:

```js
const emit = defineEmits(['notify'])
emit('notify')  // direct call
```

pue:

```purescript
emits :: DefineEmits { notify :: Unit }
emits = defineEmits
emit @"notify" emits unit  -- phantom handle passed explicitly
```

In JS, `defineEmits` returns the emit function itself. In pue, `defineEmits` is a phantom (null) — it exists only for the plugin to read the declared event types. The `emit` function needs this handle to constrain the allowed event keys via PureScript's row types.

`provide` and `inject` do not require a handle because they accept any key — there is no finite set to constrain against:

```purescript
provide @"theme" "dark"   -- no handle needed
emit @"notify" emits unit -- handle carries the row constraint
```

### `.value` becomes `readRef` / `writeRef`

Vue JS:

```js
count.value          // read
count.value = 10     // write
count.value++        // modify
```

pue:

```purescript
readRef count           -- Effect a
writeRef 10 count       -- Effect Unit
modifyRef (_ + 1) count -- Effect Unit
```

Direct `.value` access is replaced by explicit effectful operations. In practice, you rarely need `readRef` because algebraic operations (`<$>`, `<*>`, `+`, etc.) work directly on `Ref` values.

### `attrs` and `slots` are opaque

Vue JS gives record access to attributes and slots:

```js
const attrs = useAttrs()
console.log(attrs.class)

const slots = useSlots()
slots.header?.()
```

In pue, `Attrs` and `Slots` are opaque types. Their fields vary per component, and PureScript cannot type them without knowing the usage context. They are primarily used in templates where Vue handles the access.

## Side-by-side summary

| Operation | Vue JS | pue | Notes |
|---|---|---|---|
| Derived ref | `computed(() => a.value + b.value)` | `a + b` | Algebraic instances |
| Read ref | `count.value` | `readRef count` | Rarely needed due to `<$>` / `<*>` |
| Write ref | `count.value = n` | `writeRef n count` | |
| Modify ref | `count.value++` | `modifyRef (_ + 1) count` | |
| Bidirectional | `computed({ get, set })` | `focus f g ref` | |
| Props access | `props.count` | `toRef @"count" props` | Explicit reactive binding |
| Emit event | `emit('notify')` | `emit @"notify" emits unit` | Phantom handle for row constraint |
| Provide | `provide('key', val)` | `provide @"key" val` | Type-safe, no `InjectionKey` |
| Inject | `inject('key', default)` | `inject @"key" (pure default)` | Type-safe |
| Lifecycle | `onMounted(() => {})` | `onMounted effect` | `Effect` ≅ `() => void` |
| Watch | `watch(ref, cb)` | `watch ref cb` | |
