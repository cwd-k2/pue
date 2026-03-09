<template>
  <div class="card">
    <h2>Double Counter (DSL)</h2>
    <p>a: {{ a }} / b: {{ b }} / sum: {{ total }}</p>
    <button @click="incA">a+1</button>
    <button @click="incB">b+1</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script setup lang="purs">
module Pue.DoubleCounter where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, writeRef, modifyRef, computed)

a <- ref 0
b <- ref 0
total <- computed do
  va <- readRef a
  vb <- readRef b
  pure (va + vb)
incA = modifyRef (_ + 1) a
incB = modifyRef (_ + 1) b
reset = do
  writeRef 0 a
  writeRef 0 b
</script>
