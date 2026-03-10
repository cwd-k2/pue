-- | FFI module wrapping vue-router for use in PureScript components.
-- | Demonstrates the pattern for integrating any Vue ecosystem library.
module App.Router
  ( Router
  , useRouter
  , push, back
  ) where

import Prelude

import Effect (Effect)

-- | Opaque type for the vue-router instance.
foreign import data Router :: Type

-- | Access the router instance inside a component setup function.
foreign import useRouter :: Effect Router

-- | Navigate to a path.
foreign import push :: String -> Router -> Effect Unit

-- | Go back in browser history.
foreign import back :: Router -> Effect Unit
