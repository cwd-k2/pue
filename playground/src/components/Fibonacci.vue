<template>
  <div class="card">
    <h2>Fibonacci</h2>
    <p>n={{ n }} → fib={{ fibVal }}</p>
    <button @click="next">next</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script lang="purs">
module Pue.Fibonacci where

import Prelude
import Pue (Ref, ref, writeRef, modifyRef)

fib :: Int -> Int
fib n = go n 0 1
  where
  go 0 a _ = a
  go k a b = go (k - 1) b (a + b)

setup = do
  n <- ref 0
  let fibVal = fib <$> n
  let next = modifyRef (_ + 1) n
  let reset = writeRef 0 n
  pure { n, fibVal, next, reset }
</script>
