module Pue.Component
  ( Define, define_
  , DefineProps, defineProps
  , DefineEmits, defineEmits
  , DefineModel, defineModel
  , DefineExpose, defineExpose
  , DefineSlots, defineSlots
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

-- Declarations (phantom -- null at runtime, read by plugin via externs)

-- | Consolidated component metadata declaration.
-- | `Define ( props :: { ... }, emits :: { ... }, model :: { ... } )`
foreign import data Define :: Row Type -> Type
foreign import define_ :: forall (r :: Row Type). Define r

foreign import data DefineProps :: Type -> Type
foreign import data DefineEmits :: Type -> Type
foreign import data DefineModel :: Type -> Type
foreign import data DefineExpose :: Type -> Type
foreign import data DefineSlots :: Type -> Type

foreign import defineProps :: forall a. DefineProps a
foreign import defineEmits :: forall a. DefineEmits a
foreign import defineModel :: forall a. DefineModel a
foreign import defineExpose :: forall a. DefineExpose a
foreign import defineSlots :: forall a. DefineSlots a

-- Context: provide / inject with type-level keys
foreign import provideImpl :: forall a. String -> a -> Effect Unit
foreign import injectImpl :: forall a. String -> a -> Effect a

provide :: forall @key a. IsSymbol key => a -> Effect Unit
provide = provideImpl (reflectSymbol (Proxy :: _ key))

inject :: forall @key a. IsSymbol key => a -> Effect a
inject = injectImpl (reflectSymbol (Proxy :: _ key))

-- Context: ref from reactive object with type-level key
foreign import toRefImpl :: forall r a. String -> Record r -> Effect (Ref a)

toRef :: forall @key r a rest. IsSymbol key => Cons key a rest r
     => Record r -> Effect (Ref a)
toRef = toRefImpl (reflectSymbol (Proxy :: _ key))

-- Context: model ref with type-level key
foreign import useModelImpl :: forall r a. Record r -> String -> Effect (Ref a)

useModel :: forall @key r a rest. IsSymbol key => Cons key a rest r
         => Record r -> Effect (Ref a)
useModel props = useModelImpl props (reflectSymbol (Proxy :: _ key))

-- Context: utilities
foreign import useTemplateRef :: forall a. String -> Effect (Ref a)
foreign import useSlots :: forall a. Effect a
foreign import useAttrs :: forall a. Effect a
foreign import useId :: Effect String
