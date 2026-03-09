<template>
  <div>
    <p>count: {{ count }} (state preserved by KeepAlive)</p>
    <button @click="increment">+1</button>
    <ul>
      <li v-for="(entry, i) in log" :key="i">{{ entry }}</li>
    </ul>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, modifyRef, onMounted, onUnmounted, onActivated, onDeactivated)

setup = do
  count <- ref 0
  log   <- ref ([] :: Array String)

  let push msg = modifyRef (_ <> [msg]) log

  onMounted    (push "mounted")
  onUnmounted  (push "unmounted")
  onActivated  (push "activated")
  onDeactivated (push "deactivated")

  let increment = modifyRef (_ + 1) count

  pure { count, log, increment }
</script>
