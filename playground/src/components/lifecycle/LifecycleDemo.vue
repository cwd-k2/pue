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
import Prelude

import Pue (Ref, ref, readRef, writeRef, modifyRef, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted)

setup = do
  count <- ref 0
  log   <- ref ([] :: Array String)
  -- Phase guard (not in template → no reactive subscribers → writes don't trigger re-render)
  -- -1 = inactive, 0 = ready, 1 = beforeUpdate logged, 2 = updated logged
  phase <- ref (-1)

  let push msg = modifyRef (_ <> [msg]) log

  onBeforeMount  (push "beforeMount")
  onMounted      (push "mounted")

  onBeforeUpdate do
    p <- readRef phase
    when (p == 0) do
      writeRef 1 phase
      push "beforeUpdate"

  onUpdated do
    p <- readRef phase
    when (p == 1) do
      writeRef 2 phase
      push "updated"
    when (p == 2) (writeRef 0 phase)

  onBeforeUnmount (push "beforeUnmount")
  onUnmounted    (push "unmounted")

  let increment = do
        writeRef 0 phase
        modifyRef (_ + 1) count

  pure { count, log, increment }
</script>
