<template>
  <div class="card">
    <h2>GCD Calculator</h2>
    <p>gcd({{ a }}, {{ b }}) = {{ result }}</p>
    <button @click="incA">a+7</button>
    <button @click="incB">b+13</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Control.Apply (lift2)
import Pue (Ref, ref, writeRef, modifyRef)

gcd' :: Int -> Int -> Int
gcd' a 0 = a
gcd' a b = gcd' b (mod a b)

setup = do
  a <- ref 12
  b <- ref 8

  let result = lift2 gcd' a b
  let incA   = modifyRef (_ + 7) a
  let incB   = modifyRef (_ + 13) b

  let reset = do
        writeRef 12 a
        writeRef 8 b

  pure { a, b, result, incA, incB, reset }
</script>
