<template>
  <div class="card">
    <h2>watchPostEffect</h2>
    <p>count: {{ count }}</p>
    <p>synced (post-flush): {{ synced }}</p>
    <button @click="increment">+1</button>
    <p class="meta">updates after DOM flush</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, readRef, writeRef, modifyRef, Flush(..), watchEffectWith)

setup = do
  count  <- ref 0
  synced <- ref 0

  _ <- watchEffectWith Post do
    c <- readRef count
    writeRef c synced

  let increment = modifyRef (_ + 1) count

  pure { count, synced, increment }
</script>

<style scoped>
.meta { font-size: 0.8rem; color: #888; }
</style>
