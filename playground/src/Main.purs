module App.Main where

import Prelude

import Effect (Effect)
import Pue.App (Component, createApp, mount, use)

foreign import rootComponent :: Component
foreign import router :: forall a. a

main :: Effect Unit
main = do
  app <- createApp rootComponent
  use router app
  mount "#app" app
