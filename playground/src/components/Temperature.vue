<template>
  <div class="card">
    <h2>Temperature (DSL)</h2>
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

celsius <- ref 20
fahrenheit <- computed do
  c <- readRef celsius
  pure (c * 9 / 5 + 32)
hotter = modifyRef (_ + 5) celsius
cooler = modifyRef (_ - 5) celsius
</script>
