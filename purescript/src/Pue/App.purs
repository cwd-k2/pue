module Pue.App
  ( App
  , Component
  , createApp
  , mount
  , use
  , directive
  ) where

import Prelude

import Effect (Effect)

-- | Opaque type for a Vue application instance.
foreign import data App :: Type

-- | Opaque type for a Vue component definition.
-- | Obtain via FFI from a @.vue@ file or JS module.
foreign import data Component :: Type

-- | Create a Vue application instance from a root component.
foreign import createApp :: Component -> Effect App

-- | Mount the application on a DOM element selected by CSS selector.
foreign import mount :: String -> App -> Effect Unit

-- | Install a Vue plugin into the application.
foreign import use :: forall a. a -> App -> Effect Unit

-- | Register a global custom directive by name.
foreign import directive :: forall a. String -> a -> App -> Effect Unit
