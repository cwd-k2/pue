module App.Main where

import Prelude

import Effect (Effect)
import Pue.App (Component, createApp, mount)

foreign import rootComponent :: Component

main :: Effect Unit
main = do
  app <- createApp rootComponent
  mount "#app" app
