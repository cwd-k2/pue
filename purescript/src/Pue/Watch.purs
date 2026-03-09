module Pue.Watch
  ( watch, watchImmediate, watchOnce, watchWith
  , watchEffect, watchPostEffect, watchSyncEffect
  ) where

import Prelude

import Effect (Effect)
import Pue.Ref (Ref)

-- | Watch a single ref. Returns a stop handle.
foreign import watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)

-- | Watch with immediate invocation.
foreign import watchImmediate :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)

-- | Watch that fires once then auto-stops.
foreign import watchOnce :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect (Effect Unit)

-- | Watch with cleanup registration.
-- | The third callback argument registers a cleanup effect
-- | that runs before each re-invocation and on stop.
foreign import watchWith :: forall a. Ref a -> (a -> a -> (Effect Unit -> Effect Unit) -> Effect Unit) -> Effect (Effect Unit)

-- | Auto-tracking effect. Returns a stop handle.
foreign import watchEffect :: Effect Unit -> Effect (Effect Unit)

-- | watchEffect with post-flush timing.
foreign import watchPostEffect :: Effect Unit -> Effect (Effect Unit)

-- | watchEffect with synchronous timing.
foreign import watchSyncEffect :: Effect Unit -> Effect (Effect Unit)
