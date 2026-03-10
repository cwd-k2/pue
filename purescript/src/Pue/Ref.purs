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

-- | Opaque reactive cell wrapping Vue's `ref`.
-- |
-- | `Ref` is `Applicative` but intentionally not `Monad`:
-- | the dependency graph must be statically known for Vue's
-- | reactivity tracking to work correctly.
-- |
-- | Algebraic instances (`Semiring`, `HeytingAlgebra`, etc.) lift
-- | operations pointwise via `Vue.computed`, enabling arithmetic
-- | and boolean algebra directly on reactive values.
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

-- | Create a deep-reactive mutable ref.
-- |
-- | ```purescript
-- | count <- ref 0
-- | ```
foreign import ref :: forall a. a -> Effect (Ref a)

-- | Create a shallow-reactive mutable ref.
-- | Only the `.value` assignment is reactive; nested properties are not tracked.
foreign import shallowRef :: forall a. a -> Effect (Ref a)

-- | Create a read-only computed ref from an effectful getter.
-- |
-- | ```purescript
-- | doubled <- computed ((_ * 2) <$> readRef count)
-- | ```
-- |
-- | Prefer `map`/`lift2` over `computed` when the derivation is pure.
foreign import computed :: forall a. Effect a -> Effect (Ref a)

-- | Create a ref with explicit tracking and triggering control.
-- | The factory receives `track` and `trigger` callbacks and must
-- | return `{ get, set }` accessors.
foreign import customRef :: forall a. (Effect Unit -> Effect Unit -> { get :: Effect a, set :: a -> Effect Unit }) -> Effect (Ref a)

-- | Bidirectional map — a pure Ref-to-Ref lens combinator.
-- |
-- | ```purescript
-- | let fahrenheit = focus (\c -> c * 9 / 5 + 32)
-- |                        (\f -> (f - 32) * 5 / 9)
-- |                        celsius
-- | ```
-- |
-- | Writes to the result propagate back to the source through the
-- | inverse function. Backed by `Vue.computed({ get, set })`.
foreign import focus :: forall a b. (a -> b) -> (b -> a) -> Ref a -> Ref b

-- | Read the current value of a ref.
foreign import readRef :: forall a. Ref a -> Effect a

-- | Replace the value of a mutable ref.
foreign import writeRef :: forall a. a -> Ref a -> Effect Unit

-- | Apply a function to update a mutable ref in place.
-- |
-- | ```purescript
-- | modifyRef (_ + 1) count
-- | ```
foreign import modifyRef :: forall a. (a -> a) -> Ref a -> Effect Unit

-- | Force a reactivity notification on a shallow ref.
-- | Only needed after in-place mutation of the ref's inner value.
foreign import triggerRef :: forall a. Ref a -> Effect Unit

-- | Create a read-only view of a ref.
-- | Writes to the returned ref are silently ignored.
foreign import readonly :: forall a. Ref a -> Ref a
