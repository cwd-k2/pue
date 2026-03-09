<template>
  <div class="card">
    <h2>Lifecycle Hooks</h2>
    <p>mounted: {{ mounted }}</p>
    <p>count: {{ count }} (update hooks fire on change)</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup lang="purs">
module Pue.Lifecycle where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, writeRef, modifyRef, onBeforeMount, onMounted, onBeforeUpdate, onUpdated)

setup = do
  mounted <- ref false
  count <- ref 0
  onBeforeMount (pure unit)
  onMounted (writeRef true mounted)
  onBeforeUpdate (pure unit)
  onUpdated (pure unit)
  let increment = modifyRef (_ + 1) count
  pure { mounted, count, increment }
</script>
