module Pue
  ( -- Layer 0: Algebra
    Ref
  -- Layer 1: Ref Primitives
  , ref, shallowRef, computed, customRef, toRef, useTemplateRef, useModel
  , readRef
  , writeRef, modifyRef, triggerRef
  -- Layer 2: Subscriptions
  , watch, watchEffect, watchPostEffect, watchSyncEffect
  , onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted
  , onActivated, onDeactivated
  , onErrorCaptured
  , nextTick
  , EffectScope, effectScope, runScope, stopScope, onScopeDispose
  -- Layer 3: Component Interface
  , DefineProps, defineProps
  , DefineEmits, defineEmits
  , DefineModel, defineModel
  , DefineExpose, defineExpose
  , DefineSlots, defineSlots
  , provide, inject
  , useSlots, useAttrs, useId
  ) where

import Prelude

import Control.Apply (lift2)
import Data.HeytingAlgebra as HA
import Effect (Effect)

-- Layer 0: Algebra
--
-- Ref as a pure algebraic structure.
-- Functor / Apply / Applicative lift pure functions into the reactive graph.
-- All derived instances follow from Applicative via lift2.

foreign import data Ref :: Type -> Type

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

-- Layer 1: Ref Primitives
--
-- Effectful operations on the reactive state cell.
-- Ordered by source complexity: pure value → derived → reactive object → template.

-- | Construct: ... -> Effect (Ref a)
foreign import ref :: forall a. a -> Effect (Ref a)
foreign import shallowRef :: forall a. a -> Effect (Ref a)
foreign import computed :: forall a. Effect a -> Effect (Ref a)
foreign import customRef :: forall a. (Effect Unit -> Effect Unit -> { get :: Effect a, set :: a -> Effect Unit }) -> Effect (Ref a)
foreign import toRef :: forall props a. props -> String -> Effect (Ref a)
foreign import useTemplateRef :: forall a. String -> Effect (Ref a)
foreign import useModel :: forall props a. props -> String -> Effect (Ref a)

-- | Read: Ref a -> Effect a
foreign import readRef :: forall a. Ref a -> Effect a

-- | Write: ... -> Ref a -> Effect Unit
foreign import writeRef :: forall a. a -> Ref a -> Effect Unit
foreign import modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit
foreign import triggerRef :: forall a. Ref a -> Effect Unit

-- Layer 2: Subscriptions
--
-- Callback registration for reactive, lifecycle, temporal, and scope events.
-- Common pattern: register an effect to be executed at a specific point.

-- | Reactive observation
foreign import watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect Unit
foreign import watchEffect :: Effect Unit -> Effect Unit
foreign import watchPostEffect :: Effect Unit -> Effect Unit
foreign import watchSyncEffect :: Effect Unit -> Effect Unit

-- | Lifecycle: component state machine transitions
foreign import onBeforeMount :: Effect Unit -> Effect Unit
foreign import onMounted :: Effect Unit -> Effect Unit
foreign import onBeforeUpdate :: Effect Unit -> Effect Unit
foreign import onUpdated :: Effect Unit -> Effect Unit
foreign import onBeforeUnmount :: Effect Unit -> Effect Unit
foreign import onUnmounted :: Effect Unit -> Effect Unit
foreign import onActivated :: Effect Unit -> Effect Unit
foreign import onDeactivated :: Effect Unit -> Effect Unit
foreign import onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit

-- | Temporal: deferred execution
foreign import nextTick :: Effect Unit -> Effect Unit

-- | Scope: subscription lifetime management
foreign import data EffectScope :: Type
foreign import effectScope :: Effect EffectScope
foreign import runScope :: forall a. EffectScope -> Effect a -> Effect a
foreign import stopScope :: EffectScope -> Effect Unit
foreign import onScopeDispose :: Effect Unit -> Effect Unit

-- Layer 3: Component Interface
--
-- Declarations: phantom types read by the plugin at compile time.
-- Context: effectful access to the component environment.

-- | Declarations (phantom — runtime values are null)
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

-- | Context: component environment
foreign import provide :: forall a. String -> a -> Effect Unit
foreign import inject :: forall a. String -> a -> Effect a
foreign import useSlots :: forall a. Effect a
foreign import useAttrs :: forall a. Effect a
foreign import useId :: Effect String
