module Pue.Scope
  ( EffectScope
  , effectScope, effectScopeDetached
  , runScope, stopScope
  , getCurrentScope
  , onScopeDispose
  ) where

import Prelude

import Data.Maybe (Maybe(..))
import Effect (Effect)

-- | Opaque handle to a Vue effect scope.
-- | Groups reactive effects (watchers, computed) so they can be
-- | stopped together.
foreign import data EffectScope :: Type

-- | Create a new effect scope.
-- | Effects created inside are collected by the parent scope.
foreign import effectScope :: Effect EffectScope

-- | Create a detached effect scope.
-- | Not collected by the parent scope — must be stopped manually.
foreign import effectScopeDetached :: Effect EffectScope

-- | Run an effect within a scope. Reactive effects created inside
-- | are automatically associated with the scope.
foreign import runScope :: forall a. EffectScope -> Effect a -> Effect a

-- | Stop a scope, disposing all effects created within it.
foreign import stopScope :: EffectScope -> Effect Unit

-- | Get the currently active effect scope, if any.
getCurrentScope :: Effect (Maybe EffectScope)
getCurrentScope = getCurrentScopeImpl Just Nothing

-- | Register a disposal callback on the current active scope.
-- | Runs when the scope is stopped.
foreign import onScopeDispose :: Effect Unit -> Effect Unit

-- Private
foreign import getCurrentScopeImpl :: forall a. (EffectScope -> a) -> a -> Effect a
