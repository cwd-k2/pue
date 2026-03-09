<template>
  <div class="card">
    <h2>Counter (DSL)</h2>
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

count <- ref 0
increment = modifyRef (_ + 1) count
decrement = modifyRef (_ - 1) count
</script>
