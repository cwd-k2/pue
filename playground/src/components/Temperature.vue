<template>
  <div class="card">
    <h2>Temperature</h2>
    <p>{{ celsius }}°C = {{ fahrenheit }}°F</p>
    <button @click="hotter">+5°C</button>
    <button @click="cooler">-5°C</button>
  </div>
</template>

<script lang="purs">
module Pue.Temperature where

import Prelude
import Pue (Ref, ref, modifyRef)

setup = do
  celsius <- ref 20
  let fahrenheit = (\c -> c * 9 / 5 + 32) <$> celsius
  let hotter = modifyRef (_ + 5) celsius
  let cooler = modifyRef (_ - 5) celsius
  pure { celsius, fahrenheit, hotter, cooler }
</script>
