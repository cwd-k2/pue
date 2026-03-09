<template>
  <div class="card">
    <h2>Stepper (DSL, step={{ step }})</h2>
    <p>{{ value }}</p>
    <button @click="up">+{{ step }}</button>
    <button @click="down">-{{ step }}</button>
    <button @click="changeStep">step×2</button>
  </div>
</template>

<script setup lang="purs">
module Pue.Stepper where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, modifyRef)

value <- ref 0
step <- ref 1
up = do
  s <- readRef step
  modifyRef (_ + s) value
down = do
  s <- readRef step
  modifyRef (_ - s) value
changeStep = modifyRef (_ * 2) step
</script>
