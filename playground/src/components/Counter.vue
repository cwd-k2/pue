<template>
  <div class="card">
    <h2>Counter</h2>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup lang="purs">
module Pue.Counter where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, modifyRef)

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  let decrement = modifyRef (_ - 1) count
  pure { count, increment, decrement }
</script>
