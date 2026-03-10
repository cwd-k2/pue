module Pue.Scope
  ( EffectScope
  , effectScope, runScope, stopScope, onScopeDispose
  ) where

import Prelude

import Effect (Effect)

-- | Opaque handle to a Vue effect scope.
-- | Groups reactive effects (watchers, computed) so they can be
-- | stopped together.
foreign import data EffectScope :: Type

-- | Create a new effect scope.
foreign import effectScope :: Effect EffectScope

-- | Run an effect within a scope. Reactive effects created inside
-- | are automatically associated with the scope.
foreign import runScope :: forall a. EffectScope -> Effect a -> Effect a

-- | Stop a scope, disposing all effects created within it.
foreign import stopScope :: EffectScope -> Effect Unit

-- | Register a disposal callback on the current active scope.
-- | Runs when the scope is stopped.
foreign import onScopeDispose :: Effect Unit -> Effect Unit
