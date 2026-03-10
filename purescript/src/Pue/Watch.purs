module Pue.Watch
  ( watch, watchImmediate, watchOnce, watchWith
  , watchEffect, watchPostEffect, watchSyncEffect
  ) where

import Prelude

import Effect (Effect)
import Pue.Ref (Ref)

-- | Watch a single ref for changes. Returns a stop handle.
-- |
-- | ```purescript
-- | stop <- watch count \new old -> log ("changed: " <> show new)
-- | ```
foreign import watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)

-- | Watch with immediate invocation — the callback fires once
-- | with the current value before any changes occur.
foreign import watchImmediate :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)

-- | Watch that fires exactly once, then automatically stops.
foreign import watchOnce :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)

-- | Watch with cleanup registration.
-- |
-- | The callback receives `new`, `old`, and an `onCleanup` function.
-- | The registered cleanup runs before each re-invocation and on stop.
-- |
-- | ```purescript
-- | stop <- watchWith query \q _ onCleanup -> do
-- |   cancel <- fetchResults q
-- |   onCleanup cancel
-- | ```
foreign import watchWith :: forall a. Ref a -> (a -> a -> (Effect Unit -> Effect Unit) -> Effect Unit) -> Effect (Effect Unit)

-- | Auto-tracking effect — dependencies are collected automatically
-- | by reading refs inside the callback. Returns a stop handle.
-- |
-- | ```purescript
-- | stop <- watchEffect do
-- |   q <- readRef query
-- |   log ("searching: " <> q)
-- | ```
foreign import watchEffect :: Effect Unit -> Effect (Effect Unit)

-- | `watchEffect` with post-DOM-update flush timing.
-- | Use when the effect needs to access updated DOM elements.
foreign import watchPostEffect :: Effect Unit -> Effect (Effect Unit)

-- | `watchEffect` with synchronous flush timing.
-- | Fires immediately on every reactive change — use sparingly.
foreign import watchSyncEffect :: Effect Unit -> Effect (Effect Unit)
