<template>
  <div class="card">
    <h2>Watch</h2>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
    <ul>
      <li v-for="(entry, i) in history" :key="i">{{ entry }}</li>
    </ul>
  </div>
</template>

<script setup lang="purs">
module Pue.WatchDemo where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, modifyRef, watch)

setup = do
  count <- ref 0
  history <- ref ([] :: Array String)
  watch count (\newVal oldVal -> modifyRef (\xs -> xs <> [show oldVal <> " → " <> show newVal]) history)
  let increment = modifyRef (_ + 1) count
  pure { count, history, increment }
</script>
