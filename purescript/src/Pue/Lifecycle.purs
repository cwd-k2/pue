module Pue.Lifecycle
  ( onBeforeMount, onMounted, onBeforeUpdate, onUpdated
  , onBeforeUnmount, onUnmounted
  , onActivated, onDeactivated
  , onErrorCaptured
  , onRenderTracked, onRenderTriggered
  , onServerPrefetch
  , nextTick
  ) where

import Prelude

import Effect (Effect)

-- | Register a callback before the component is mounted to the DOM.
foreign import onBeforeMount :: Effect Unit -> Effect Unit

-- | Register a callback after the component is mounted to the DOM.
-- | Commonly used for DOM measurements and third-party integrations.
foreign import onMounted :: Effect Unit -> Effect Unit

-- | Register a callback before the component re-renders due to reactive changes.
foreign import onBeforeUpdate :: Effect Unit -> Effect Unit

-- | Register a callback after the component has re-rendered.
foreign import onUpdated :: Effect Unit -> Effect Unit

-- | Register a callback before the component is unmounted.
-- | Use for cleanup: cancel timers, remove event listeners.
foreign import onBeforeUnmount :: Effect Unit -> Effect Unit

-- | Register a callback after the component is unmounted.
foreign import onUnmounted :: Effect Unit -> Effect Unit

-- | Register a callback when a `<KeepAlive>` component is activated.
foreign import onActivated :: Effect Unit -> Effect Unit

-- | Register a callback when a `<KeepAlive>` component is deactivated.
foreign import onDeactivated :: Effect Unit -> Effect Unit

-- | Register an error handler that captures errors from descendant components.
-- | Return `true` to prevent the error from propagating further.
foreign import onErrorCaptured :: forall a. (a -> Effect Boolean) -> Effect Unit

-- | Debug hook: called when a reactive dependency is tracked during render.
-- | Receives the debugger event. Development mode only.
foreign import onRenderTracked :: forall a. (a -> Effect Unit) -> Effect Unit

-- | Debug hook: called when a reactive dependency triggers a re-render.
-- | Receives the debugger event. Development mode only.
foreign import onRenderTriggered :: forall a. (a -> Effect Unit) -> Effect Unit

-- | Register an async prefetch hook for server-side rendering.
-- | The callback may return a Promise to defer rendering until resolved.
-- |
-- | ```purescript
-- | onServerPrefetch do
-- |   fetchData >>= writeRef data_
-- | ```
foreign import onServerPrefetch :: forall a. Effect a -> Effect Unit

-- | Defer a callback to the next DOM update flush.
foreign import nextTick :: Effect Unit -> Effect Unit
