module Pue.Lifecycle
  ( onBeforeMount, onMounted, onBeforeUpdate, onUpdated
  , onBeforeUnmount, onUnmounted
  , onActivated, onDeactivated
  , onErrorCaptured
  , nextTick
  ) where

import Prelude

import Effect (Effect)

foreign import onBeforeMount :: Effect Unit -> Effect Unit
foreign import onMounted :: Effect Unit -> Effect Unit
foreign import onBeforeUpdate :: Effect Unit -> Effect Unit
foreign import onUpdated :: Effect Unit -> Effect Unit
foreign import onBeforeUnmount :: Effect Unit -> Effect Unit
foreign import onUnmounted :: Effect Unit -> Effect Unit
foreign import onActivated :: Effect Unit -> Effect Unit
foreign import onDeactivated :: Effect Unit -> Effect Unit
foreign import onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit
foreign import nextTick :: Effect Unit -> Effect Unit
