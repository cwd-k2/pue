<template>
  <div class="card">
    <h2>Lifecycle Hooks</h2>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
    <ul>
      <li v-for="(entry, i) in log" :key="i">{{ entry }}</li>
    </ul>
  </div>
</template>

<script lang="purs">
module Pue.LifecycleDemo where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, modifyRef, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted)

setup = do
  count <- ref 0
  log <- ref ([] :: Array String)
  let push msg = modifyRef (\xs -> xs <> [msg]) log
  onBeforeMount (push "beforeMount")
  onMounted (push "mounted")
  onBeforeUpdate (push "beforeUpdate")
  onUpdated (push "updated")
  onBeforeUnmount (push "beforeUnmount")
  onUnmounted (push "unmounted")
  let increment = modifyRef (_ + 1) count
  pure { count, log, increment }
</script>
