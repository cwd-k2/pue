<template>
  <div class="card">
    <h2>Fibonacci (DSL)</h2>
    <p>n={{ n }} → fib={{ fibVal }}</p>
    <button @click="next">next</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script setup lang="purs">
module Pue.Fibonacci where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, writeRef, modifyRef, computed)

fib :: Int -> Int
fib n = go n 0 1
  where
  go 0 a _ = a
  go k a b = go (k - 1) b (a + b)

n <- ref 0
fibVal <- computed do
  v <- readRef n
  pure (fib v)
next = modifyRef (_ + 1) n
reset = writeRef 0 n
</script>
