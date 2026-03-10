module Pue.Directive
  ( Directive
  , Element
  , on, onWith
  , mounted, mountedWith
  , updated, updatedWith
  , beforeUnmount, beforeUnmountWith
  , unmounted, unmountedWith
  , focus, blur
  , setStyle, setAttribute
  , addClass, removeClass
  ) where

import Prelude

import Effect (Effect)

-- | Opaque type for a DOM element, as passed to directive hooks.
foreign import data Element :: Type

-- | A Vue custom directive definition.
-- | Composes via Semigroup: @mounted f <> unmounted g@.
foreign import data Directive :: Type

foreign import mergeDirectives :: Directive -> Directive -> Directive
foreign import emptyDirective :: Directive

instance Semigroup Directive where
  append = mergeDirectives

instance Monoid Directive where
  mempty = emptyDirective

-- | Shorthand: fires on both mount and update.
on :: (Element -> Effect Unit) -> Directive
on f = mounted f <> updated f

-- | Shorthand with binding value: fires on both mount and update.
onWith :: forall a. (Element -> a -> Effect Unit) -> Directive
onWith f = mountedWith f <> updatedWith f

-- Lifecycle hook constructors

foreign import mounted :: (Element -> Effect Unit) -> Directive
foreign import mountedWith :: forall a. (Element -> a -> Effect Unit) -> Directive
foreign import updated :: (Element -> Effect Unit) -> Directive
foreign import updatedWith :: forall a. (Element -> a -> Effect Unit) -> Directive
foreign import beforeUnmount :: (Element -> Effect Unit) -> Directive
foreign import beforeUnmountWith :: forall a. (Element -> a -> Effect Unit) -> Directive
foreign import unmounted :: (Element -> Effect Unit) -> Directive
foreign import unmountedWith :: forall a. (Element -> a -> Effect Unit) -> Directive

-- DOM helpers for directive hooks

foreign import focus :: Element -> Effect Unit
foreign import blur :: Element -> Effect Unit
foreign import setStyle :: String -> String -> Element -> Effect Unit
foreign import setAttribute :: String -> String -> Element -> Effect Unit
foreign import addClass :: String -> Element -> Effect Unit
foreign import removeClass :: String -> Element -> Effect Unit
