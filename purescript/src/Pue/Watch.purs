module Pue.Watch
  ( WatchHandle
  , Flush(..)
  , WatchOptions, watchOptions
  , watch, watchWith
  , watchEffect, watchEffectWith
  , onCleanup
  ) where

import Prelude

import Effect (Effect)
import Pue.Ref (Ref)

-- | Handle returned by watch functions.
-- | Supports stopping, pausing (3.5+), and resuming the watcher.
-- |
-- | ```purescript
-- | handle <- watch count \new old -> log (show new)
-- | handle.pause
-- | handle.resume
-- | handle.stop
-- | ```
type WatchHandle =
  { stop   :: Effect Unit
  , pause  :: Effect Unit
  , resume :: Effect Unit
  }

-- | Flush timing for watch effects.
data Flush = Pre | Post | Sync

-- | Options for `watchWith`.
type WatchOptions =
  { immediate :: Boolean
  , once      :: Boolean
  , deep      :: Boolean
  , flush     :: Flush
  }

-- | Default watch options: not immediate, not once, not deep, pre flush.
watchOptions :: WatchOptions
watchOptions = { immediate: false, once: false, deep: false, flush: Pre }

-- | Watch a reactive ref for changes.
-- |
-- | ```purescript
-- | -- Single ref
-- | _ <- watch count \new old ->
-- |   modifyRef (_ <> [show new]) history
-- |
-- | -- Derived (Functor)
-- | _ <- watch ((_ * 2) <$> count) \doubled old ->
-- |   log (show doubled)
-- |
-- | -- Multiple sources (Applicative)
-- | _ <- watch (Tuple <$> firstName <*> lastName) \new old ->
-- |   log (show new)
-- | ```
watch :: forall a. Ref a -> (a -> a -> Effect Unit) -> Effect WatchHandle
watch = watchWith watchOptions

-- | Watch with explicit options.
-- |
-- | ```purescript
-- | _ <- watchWith (watchOptions { deep = true, immediate = true }) obj \new old ->
-- |   log "deep change detected"
-- | ```
watchWith :: forall a. WatchOptions -> Ref a -> (a -> a -> Effect Unit) -> Effect WatchHandle
watchWith opts source cb = watchImpl source cb (toJsOpts opts)

-- | Auto-tracking reactive effect with pre-flush timing (default).
-- | Dependencies are collected by reading refs inside the callback.
-- |
-- | ```purescript
-- | _ <- watchEffect do
-- |   q <- readRef query
-- |   log ("searching: " <> q)
-- | ```
watchEffect :: Effect Unit -> Effect WatchHandle
watchEffect = watchEffectWith Pre

-- | Auto-tracking effect with explicit flush timing.
-- |
-- | ```purescript
-- | _ <- watchEffectWith Post do
-- |   c <- readRef count
-- |   writeRef c synced
-- | ```
watchEffectWith :: Flush -> Effect Unit -> Effect WatchHandle
watchEffectWith flush eff = watchEffectImpl eff (flushStr flush)

-- | Register a cleanup function inside a watch or watchEffect callback.
-- | The cleanup runs before each re-invocation and when the watcher stops.
-- |
-- | ```purescript
-- | _ <- watch query \q _ -> do
-- |   cancel <- fetchResults q
-- |   onCleanup cancel
-- | ```
foreign import onCleanup :: Effect Unit -> Effect Unit

-- Private

flushStr :: Flush -> String
flushStr = case _ of
  Pre  -> "pre"
  Post -> "post"
  Sync -> "sync"

toJsOpts :: WatchOptions -> { immediate :: Boolean, once :: Boolean, deep :: Boolean, flush :: String }
toJsOpts { immediate, once, deep, flush } =
  { immediate, once, deep, flush: flushStr flush }

foreign import watchImpl
  :: forall a
   . Ref a
  -> (a -> a -> Effect Unit)
  -> { immediate :: Boolean, once :: Boolean, deep :: Boolean, flush :: String }
  -> Effect WatchHandle

foreign import watchEffectImpl :: Effect Unit -> String -> Effect WatchHandle
