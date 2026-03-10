module Lib.Temperature
  ( toFahrenheit
  , toCelsius
  ) where

import Prelude

toFahrenheit :: Int -> Int
toFahrenheit c = c * 9 / 5 + 32

toCelsius :: Int -> Int
toCelsius f = (f - 32) * 5 / 9
