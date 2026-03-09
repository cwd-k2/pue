<template>
  <div class="card">
    <h2>GCD Calculator (DSL)</h2>
    <p>gcd({{ a }}, {{ b }}) = {{ result }}</p>
    <button @click="incA">a+7</button>
    <button @click="incB">b+13</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script setup lang="purs">
module Pue.GCD where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, writeRef, modifyRef, computed)

gcd' :: Int -> Int -> Int
gcd' a 0 = a
gcd' a b = gcd' b (mod a b)

a <- ref 12
b <- ref 8
result <- computed do
  va <- readRef a
  vb <- readRef b
  pure (gcd' va vb)
incA = modifyRef (_ + 7) a
incB = modifyRef (_ + 13) b
reset = do
  writeRef 12 a
  writeRef 8 b
</script>
