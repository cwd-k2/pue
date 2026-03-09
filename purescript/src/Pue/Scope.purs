module Pue.Scope
  ( EffectScope
  , effectScope, runScope, stopScope, onScopeDispose
  ) where

import Prelude

import Effect (Effect)

foreign import data EffectScope :: Type
foreign import effectScope :: Effect EffectScope
foreign import runScope :: forall a. EffectScope -> Effect a -> Effect a
foreign import stopScope :: EffectScope -> Effect Unit
foreign import onScopeDispose :: Effect Unit -> Effect Unit
