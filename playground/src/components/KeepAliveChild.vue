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
module Pue.KeepAliveChild where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, modifyRef, onMounted, onUnmounted, onActivated, onDeactivated)

components = [] :: Array String

setup = do
  count <- ref 0
  log <- ref ([] :: Array String)
  let push msg = modifyRef (\xs -> xs <> [msg]) log
  onMounted (push "mounted")
  onUnmounted (push "unmounted")
  onActivated (push "activated")
  onDeactivated (push "deactivated")
  let increment = modifyRef (_ + 1) count
  pure { count, log, increment }
</script>
