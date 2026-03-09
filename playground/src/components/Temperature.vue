<template>
  <div class="card">
    <h2>Temperature</h2>
    <p>{{ celsius }}°C = {{ fahrenheit }}°F</p>
    <button @click="hotter">+5°C</button>
    <button @click="cooler">-5°C</button>
  </div>
</template>

<script setup lang="purs">
module Pue.Temperature where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, modifyRef, computed)

setup :: Effect { celsius :: Ref Int, fahrenheit :: Ref Int, hotter :: Effect Unit, cooler :: Effect Unit }
setup = do
  celsius <- ref 20
  fahrenheit <- computed do
    c <- readRef celsius
    pure (c * 9 / 5 + 32)
  let hotter = modifyRef (_ + 5) celsius
  let cooler = modifyRef (_ - 5) celsius
  pure { celsius, fahrenheit, hotter, cooler }
</script>
