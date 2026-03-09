module Pue
  ( Ref
  , ref
  , readRef
  , writeRef
  , modifyRef
  , computed
  , watch
  , watchEffect
  , onBeforeMount
  , onMounted
  , onBeforeUpdate
  , onUpdated
  , onBeforeUnmount
  , onUnmounted
  , onErrorCaptured
  , provide
  , inject
  , nextTick
  , shallowRef
  , toRef
  , useTemplateRef
  , useSlots
  , useAttrs
  , useId
  , DefineProps
  , defineProps
  , DefineEmits
  , defineEmits
  , DefineModel
  , defineModel
  , DefineExpose
  , defineExpose
  , DefineSlots
  , defineSlots
  ) where

import Prelude

import Control.Apply (lift2)
import Data.HeytingAlgebra as HA
import Effect (Effect)

-- | Opaque reactive reference wrapping Vue's ref/computed.
-- | Supports Functor/Apply/Applicative — derived refs via Vue.computed.
foreign import data Ref :: Type -> Type

-- Layer 0: Algebraic core

foreign import mapRef :: forall a b. (a -> b) -> Ref a -> Ref b
foreign import applyRef :: forall a b. Ref (a -> b) -> Ref a -> Ref b
foreign import pureRef :: forall a. a -> Ref a

instance Functor Ref where
  map = mapRef

instance Apply Ref where
  apply = applyRef

instance Applicative Ref where
  pure = pureRef

instance Semigroup a => Semigroup (Ref a) where
  append = lift2 append

instance Monoid a => Monoid (Ref a) where
  mempty = pure mempty

instance Semiring a => Semiring (Ref a) where
  add = lift2 add
  mul = lift2 mul
  zero = pure zero
  one = pure one

instance Ring a => Ring (Ref a) where
  sub = lift2 sub

instance HeytingAlgebra a => HeytingAlgebra (Ref a) where
  ff = pure HA.ff
  tt = pure HA.tt
  implies = lift2 HA.implies
  conj = lift2 HA.conj
  disj = lift2 HA.disj
  not = map HA.not

instance BooleanAlgebra a => BooleanAlgebra (Ref a)

-- Layer 1: Effectful operations

foreign import ref :: forall a. a -> Effect (Ref a)
foreign import readRef :: forall a. Ref a -> Effect a
foreign import writeRef :: forall a. a -> Ref a -> Effect Unit
foreign import modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit
foreign import computed :: forall a. Effect a -> Effect (Ref a)
foreign import watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit
foreign import watchEffect :: Effect Unit -> Effect Unit
foreign import shallowRef :: forall a. a -> Effect (Ref a)
foreign import toRef :: forall props a. props -> String -> Effect (Ref a)

-- Lifecycle
foreign import onBeforeMount :: Effect Unit -> Effect Unit
foreign import onMounted :: Effect Unit -> Effect Unit
foreign import onBeforeUpdate :: Effect Unit -> Effect Unit
foreign import onUpdated :: Effect Unit -> Effect Unit
foreign import onBeforeUnmount :: Effect Unit -> Effect Unit
foreign import onUnmounted :: Effect Unit -> Effect Unit
foreign import onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit

-- Dependency injection
foreign import provide :: forall a. String -> a -> Effect Unit
foreign import inject :: forall a. String -> a -> Effect a

-- Async
foreign import nextTick :: Effect Unit -> Effect Unit

-- Layer 2: Component interface (phantom types — plugin reads type annotations)

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

-- Layer 3: Runtime utilities

foreign import useTemplateRef :: forall a. String -> Effect (Ref a)
foreign import useSlots :: forall a. Effect a
foreign import useAttrs :: forall a. Effect a
foreign import useId :: Effect String
