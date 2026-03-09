module Pue.Ref
  ( Ref
  , ref, shallowRef, computed, customRef
  , focus
  , readRef
  , writeRef, modifyRef, triggerRef
  , readonly
  ) where

import Prelude

import Control.Apply (lift2)
import Data.HeytingAlgebra as HA
import Effect (Effect)

-- | Opaque reactive cell wrapping Vue's Ref.
-- | Applicative but intentionally not Monad (static dependency graph).
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

instance CommutativeRing a => CommutativeRing (Ref a)

instance HeytingAlgebra a => HeytingAlgebra (Ref a) where
  ff = pure HA.ff
  tt = pure HA.tt
  implies = lift2 HA.implies
  conj = lift2 HA.conj
  disj = lift2 HA.disj
  not = map HA.not

instance BooleanAlgebra a => BooleanAlgebra (Ref a)

-- Construction
foreign import ref :: forall a. a -> Effect (Ref a)
foreign import shallowRef :: forall a. a -> Effect (Ref a)
foreign import computed :: forall a. Effect a -> Effect (Ref a)
foreign import customRef :: forall a. (Effect Unit -> Effect Unit -> { get :: Effect a, set :: a -> Effect Unit }) -> Effect (Ref a)

-- | Bidirectional map over a Ref — a pure Ref-to-Ref combinator.
-- | `focus get set source` creates a computed Ref that reads via `get`
-- | and writes back to `source` via `set`.
foreign import focus :: forall a b. (a -> b) -> (b -> a) -> Ref a -> Ref b

-- Read
foreign import readRef :: forall a. Ref a -> Effect a

-- Write
foreign import writeRef :: forall a. a -> Ref a -> Effect Unit
foreign import modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit
foreign import triggerRef :: forall a. Ref a -> Effect Unit

-- View
foreign import readonly :: forall a. Ref a -> Ref a
