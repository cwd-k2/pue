# Type System

Vue's reactivity system, when expressed through PureScript's types, reveals a layered structure that is not a design choice but a consequence of the type signatures themselves.

## Effect as Deferred Computation

PureScript's `Effect a` compiles to `() => a`. This is the exact shape Vue requires at every interface:

| PureScript | JS | Vue expects |
|---|---|---|
| `ref 0 :: Effect (Ref Int)` | `() => Vue.ref(0)` | setup returns deferred construction |
| `computed f :: Effect (Ref a)` | `() => Vue.computed(f)` | `f` is itself `() => a` |
| `onMounted cb :: Effect Unit` | `() => Vue.onMounted(cb)` | `cb` is `() => void` |
| `modifyRef f r :: Effect Unit` | `() => { r.value = f(r.value) }` | event handler |
| `setup :: Effect { ... }` | `() => { ... }` | component `setup()` function |

The alignment is structural, not incidental. Vue is a system of deferred effects; `Effect` is PureScript's type for exactly that.

## The Four Layers

Every operation in the `Pue` module falls into one of four layers, determined by its type signature pattern. This classification is exhaustive — no operation crosses a layer boundary.

```
Layer 0   Algebra          Ref a → Ref b                            no Effect
Layer 1   Ref Primitives   ... → Effect (Ref a) | Ref a → Effect a | ... → Ref a → Effect Unit
Layer 2   Subscriptions    handler → Effect (Effect Unit) | handler → Effect Unit
Layer 3   Interface        DefineX a (phantom) | String → a → Effect ... | Effect a
```

### Layer 0: Algebra — `Ref a → Ref b`

`Ref` is an opaque type wrapping Vue's reactive cell. Its algebraic structure:

```
Functor       map   :: (a → b)     → Ref a → Ref b
Apply         apply :: Ref (a → b) → Ref a → Ref b
Applicative   pure  :: a           → Ref a
```

Each operation generates a `Vue.computed` — a node in the reactive dependency graph. Algebraic operations are graph construction:

```purescript
let total = a + b              -- Semiring: adds a computed node
let label = show <$> count     -- Functor:  adds a computed node
let full  = f <$> x <*> y      -- Apply:    adds a computed node combining two sources
```

All derived instances follow from `Applicative` via `lift2`:

```
Semigroup a      ⇒ Semigroup (Ref a)         lift2 append
Monoid a         ⇒ Monoid (Ref a)            pure mempty
Semiring a       ⇒ Semiring (Ref a)          lift2 add, lift2 mul, pure zero, pure one
Ring a           ⇒ Ring (Ref a)              lift2 sub
HeytingAlgebra a ⇒ HeytingAlgebra (Ref a)    lift2 conj, lift2 disj, map not
BooleanAlgebra a ⇒ BooleanAlgebra (Ref a)    (empty body — derived)
```

The key property: **Layer 0 has no `Effect`**. The reactive graph is built purely. Side effects first appear in Layer 1.

### Layer 1: Ref Primitives — `Effect` + `Ref`

Effectful operations on the reactive cell. Three verbs, three type patterns:

```
Construct   ... → Effect (Ref a)           ref, shallowRef, computed, customRef,
                                           toRef, useTemplateRef, useModel

Read        Ref a → Effect a               readRef

Write       ... → Ref a → Effect Unit      writeRef, modifyRef, triggerRef
```

Every function in this layer mentions both `Ref` and `Effect`. The classification by verb is complete — any operation on a reactive cell is construction, read, or write.

`triggerRef` does not modify the cell's value. It notifies dependents that the value should be treated as changed. In the type signature `Ref a → Effect Unit`, it matches the write pattern: an effectful operation targeted at a specific Ref. Semantically, it is the effect-side dual of `readRef` — where `readRef` establishes a dependency ("I read from this cell"), `triggerRef` propagates a change ("this cell was written").

`customRef` exposes Vue's dependency tracking mechanism at the type level:

```purescript
customRef :: (Effect Unit → Effect Unit → { get :: Effect a, set :: a → Effect Unit }) → Effect (Ref a)
```

The factory receives `track` (establish dependency) and `trigger` (notify change) — the two fundamental operations that underlie all of Layer 0's `computed` generation.

### Layer 2: Subscriptions — callback registration

Every function in this layer registers a handler to be executed at a specific point. The functions split into two groups by return type, encoding a semantic distinction:

**Cancellable** — returns `Effect (Effect Unit)`:

```
watch           :: Ref a → (a → a → Effect Unit) → Effect (Effect Unit)
watchImmediate  :: Ref a → (a → a → Effect Unit) → Effect (Effect Unit)
watchEffect     :: Effect Unit → Effect (Effect Unit)
watchPostEffect :: Effect Unit → Effect (Effect Unit)
watchSyncEffect :: Effect Unit → Effect (Effect Unit)
```

The inner `Effect Unit` is the stop handle. PureScript's `Discard` class has no instance for `Effect Unit`, so the compiler forces explicit acknowledgment:

```purescript
_ <- watchEffect do ...       -- explicitly discard stop handle
stop <- watch count \n o -> ...   -- capture stop handle for later use
```

**Non-cancellable** — returns `Effect Unit`:

```
onBeforeMount, onMounted, onBeforeUpdate, onUpdated,
onBeforeUnmount, onUnmounted, onActivated, onDeactivated
  :: Effect Unit → Effect Unit

onErrorCaptured :: (a → Effect Boolean) → Effect Unit

nextTick :: Effect Unit → Effect Unit

onScopeDispose :: Effect Unit → Effect Unit
```

These subscriptions are lifetime-bound: to the component (lifecycle hooks), to the next DOM flush (nextTick), or to the enclosing scope (onScopeDispose). There is no manual stop because the lifetime is determined by context, not by the caller.

The return type distinction is not a convention — it is a type-level encoding of subscription semantics. In JavaScript, both groups return `void` or ignore the return value. PureScript's types make the difference explicit.

**Scope management** provides meta-operations over subscriptions:

```
EffectScope  :: Type
effectScope  :: Effect EffectScope                  create a scope
runScope     :: EffectScope → Effect a → Effect a   execute effects within scope
stopScope    :: EffectScope → Effect Unit            stop all subscriptions in scope
```

`runScope` is a higher-order effect combinator: it changes the scope context in which subscriptions are registered, so that `stopScope` can cancel them as a group.

**Sub-classification within Layer 2:**

| Sub-group | Source | Lifetime | Return |
|---|---|---|---|
| Reactive | value change | manual | `Effect (Effect Unit)` |
| Lifecycle | component state | component | `Effect Unit` |
| Temporal | DOM flush | one-shot | `Effect Unit` |
| Scope | scope disposal | scope | `Effect Unit` |

### Layer 3: Component Interface — phantom types + context

This layer sits at the boundary between PureScript and Vue's component system.

**Declarations** are phantom types — `null` at runtime, read by the Vite plugin at compile time:

```
DefineProps, DefineEmits, DefineModel, DefineExpose, DefineSlots :: Type → Type

defineProps  :: DefineProps a       -- runtime value: null
defineEmits :: DefineEmits a       -- runtime value: null
...
```

The type annotation `DefineProps { msg :: String, count :: Int }` is extracted by regex from PureScript source and compiled into Vue's `props: { msg: { type: String }, count: { type: Number } }`. Type information passes between two compilers — PureScript's and Vue's — through the plugin as intermediary.

**Context** provides effectful access to the component environment:

```
provide  :: String → a → Effect Unit      inject into descendant tree
inject   :: String → a → Effect a         read from ancestor tree
useSlots :: Effect a                       access slot functions
useAttrs :: Effect a                       access fallthrough attributes
useId    :: Effect String                  generate unique ID
```

`provide`/`inject` implement dependency injection along the component tree — information diffuses down the hierarchy through a string-keyed channel, stepping outside PureScript's type safety by necessity.

## The Purity Gradient

```
        Layer 0          Layer 1          Layer 2              Layer 3
        ────────         ────────         ────────             ────────
Effect  absent           introduced       pervasive            boundary
Ref     transformed      constructed      observed             declared
Time    none             instant          deferred/reactive    compile-time
```

Moving left to right, purity relaxes in stages:

- **Layer 0** is timeless. `Ref a → Ref b` is a static relationship in the dependency graph.
- **Layer 1** introduces the present. `Effect` marks operations that happen now: create a cell, read its value, write to it.
- **Layer 2** introduces the future. Callbacks are registered now but execute later, in response to value changes, component events, or DOM updates.
- **Layer 3** crosses the system boundary. Phantom types communicate with an external tool (the Vite plugin), and context operations (provide/inject) communicate with an external topology (the component tree).

Each transition is a phase boundary where new capabilities appear and new constraints apply.
