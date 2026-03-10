module Pue.Component
  ( DefineComponent, defineComponent
  , DefineProps, defineProps
  , DefineEmits, defineEmits
  , DefineModel, defineModel
  , DefineExpose, defineExpose
  , DefineSlots, defineSlots
  , defineOptions, defineDefaults
  , emit
  , provide, inject
  , toRef, useTemplateRef, useModel
  , useSlots, useAttrs, useId
  ) where

import Prelude

import Data.Symbol (class IsSymbol, reflectSymbol)
import Effect (Effect)
import Prim.Row (class Cons)
import Pue.Ref (Ref)
import Type.Proxy (Proxy(..))

-- Phantom declarations — null at runtime, read by plugin via externs.

-- | Consolidated component metadata. Combines props, emits, model,
-- | expose, and slots into a single row-typed declaration.
-- |
-- | ```purescript
-- | define :: DefineComponent
-- |   ( props :: { count :: Int, label :: String }
-- |   , emits :: { increment :: Unit }
-- |   )
-- | define = defineComponent
-- | ```
foreign import data DefineComponent :: Row Type -> Type

-- | Phantom value for `DefineComponent`. Null at runtime.
foreign import defineComponent :: forall (r :: Row Type). DefineComponent r

-- | Declare accepted props with their types.
-- | Also serves as a typed handle for `toRef` and `useModel`.
-- |
-- | ```purescript
-- | props :: DefineProps { count :: Int, label :: String }
-- | props = defineProps
-- | ```
foreign import data DefineProps :: Type -> Type

-- | Declare emitted events with their payload types.
-- | Also serves as a typed handle for `emit`.
-- |
-- | ```purescript
-- | emits :: DefineEmits { increment :: Unit }
-- | emits = defineEmits
-- | ```
foreign import data DefineEmits :: Type -> Type

-- | Declare v-model bindings with their types.
foreign import data DefineModel :: Type -> Type

-- | Declare the public interface exposed to parent via template refs.
foreign import data DefineExpose :: Type -> Type

-- | Declare named slot types for type-safe slot usage.
foreign import data DefineSlots :: Type -> Type

-- | Phantom value for `DefineProps`. Null at runtime.
foreign import defineProps :: forall a. DefineProps a

-- | Phantom value for `DefineEmits`. Null at runtime.
foreign import defineEmits :: forall a. DefineEmits a

-- | Phantom value for `DefineModel`. Null at runtime.
foreign import defineModel :: forall a. DefineModel a

-- | Phantom value for `DefineExpose`. Null at runtime.
foreign import defineExpose :: forall a. DefineExpose a

-- | Phantom value for `DefineSlots`. Null at runtime.
foreign import defineSlots :: forall a. DefineSlots a

-- | Declare Vue component options (e.g. `inheritAttrs`).
-- | Identity at runtime — the plugin extracts the record value.
-- |
-- | ```purescript
-- | options = defineOptions { inheritAttrs: false }
-- | ```
foreign import defineOptions :: forall r. { | r } -> { | r }

-- | Declare default values for props.
-- | Identity at runtime — the plugin extracts the record value.
-- |
-- | ```purescript
-- | defaults = defineDefaults { count: 0, label: "untitled" }
-- | ```
foreign import defineDefaults :: forall r. { | r } -> { | r }

-- | Emit a typed event. The event name and payload type are checked
-- | against the `DefineEmits` row at compile time.
-- | At runtime, uses `getCurrentInstance().emit`.
-- |
-- | ```purescript
-- | emits :: DefineEmits { notify :: Unit }
-- | emits = defineEmits
-- |
-- | let notify = emit @"notify" emits unit
-- | ```
emit :: forall @key r a rest
      . IsSymbol key
     => Cons key a rest r
     => DefineEmits { | r } -> a -> Effect Unit
emit = emitImpl (reflectSymbol (Proxy :: _ key))

foreign import emitImpl :: forall source a. String -> source -> a -> Effect Unit

-- | Provide a value to descendant components under a type-level key.
-- |
-- | ```purescript
-- | provide @"theme" "dark"
-- | ```
provide :: forall @key a. IsSymbol key => a -> Effect Unit
provide = provideImpl (reflectSymbol (Proxy :: _ key))

-- | Inject a value provided by an ancestor, with a default fallback.
-- |
-- | ```purescript
-- | theme <- inject @"theme" "light"
-- | ```
inject :: forall @key a. IsSymbol key => a -> Effect a
inject = injectImpl (reflectSymbol (Proxy :: _ key))

-- | Create a reactive ref from a single prop.
-- | The key and value type are checked against the `DefineProps` row.
-- | At runtime, uses `getCurrentInstance().props`.
-- |
-- | ```purescript
-- | props :: DefineProps { count :: Int }
-- | props = defineProps
-- |
-- | countRef <- toRef @"count" props
-- | ```
toRef :: forall @key r a rest
      . IsSymbol key
     => Cons key a rest r
     => DefineProps { | r } -> Effect (Ref a)
toRef = toRefImpl (reflectSymbol (Proxy :: _ key))

-- | Create a writable ref synced with a v-model prop.
-- | Accepts a `DefineModel` declaration; writes to the ref
-- | automatically emit `update:<key>`.
-- |
-- | ```purescript
-- | model :: DefineModel { modelValue :: Int }
-- | model = defineModel
-- |
-- | modelRef <- useModel @"modelValue" model
-- | ```
useModel :: forall @key r a rest
         . IsSymbol key
        => Cons key a rest r
        => DefineModel { | r } -> Effect (Ref a)
useModel source = useModelImpl source (reflectSymbol (Proxy :: _ key))

-- | Obtain a template ref by its string name.
-- | Returns a `Ref` that is `null` until the component mounts.
foreign import useTemplateRef :: forall a. String -> Effect (Ref a)

-- | Access the component's slots object.
foreign import useSlots :: forall a. Effect a

-- | Access fallthrough attributes not declared as props.
foreign import useAttrs :: forall a. Effect a

-- | Generate a unique ID for accessibility attributes (`aria-*`).
foreign import useId :: Effect String

-- Internal implementations
foreign import provideImpl :: forall a. String -> a -> Effect Unit
foreign import injectImpl :: forall a. String -> a -> Effect a
foreign import toRefImpl :: forall source a. String -> source -> Effect (Ref a)
foreign import useModelImpl :: forall source a. source -> String -> Effect (Ref a)
