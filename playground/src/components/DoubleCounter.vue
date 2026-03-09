<template>
  <div class="card">
    <h2>Double Counter</h2>
    <p>a: {{ a }} / b: {{ b }} / sum: {{ total }}</p>
    <button @click="incA">a+1</button>
    <button @click="incB">b+1</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script lang="purs">
module Pue.DoubleCounter where

import Prelude
import Pue (Ref, ref, writeRef, modifyRef)

setup = do
  a <- ref 0
  b <- ref 0
  let total = a + b
  let incA = modifyRef (_ + 1) a
  let incB = modifyRef (_ + 1) b
  let reset = do
        writeRef 0 a
        writeRef 0 b
  pure { a, b, total, incA, incB, reset }
</script>
