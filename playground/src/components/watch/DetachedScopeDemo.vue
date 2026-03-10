<template>
  <div class="card">
    <h2>Detached Scope</h2>
    <p>count: {{ count }}</p>
    <p>attached: {{ attachedVal }} <span class="meta">(child of parent)</span></p>
    <p>detached: {{ detachedVal }} <span class="meta">(independent)</span></p>
    <button @click="increment">+1</button>
    <button @click="stopParent">Stop parent</button>
    <button @click="stopDetached">Stop detached</button>
    <p class="meta">{{ status }}</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, readRef, writeRef, modifyRef, watchEffect, effectScope, effectScopeDetached, runScope, stopScope)

setup = do
  count       <- ref 0
  attachedVal <- ref 0
  detachedVal <- ref 0
  status      <- ref "both active"

  parent <- effectScope

  -- Attached watcher + detached scope created inside parent
  detached <- runScope parent do
    _ <- watchEffect do
      c <- readRef count
      writeRef c attachedVal

    d <- effectScopeDetached
    runScope d do
      _ <- watchEffect do
        c <- readRef count
        writeRef c detachedVal
      pure unit

    pure d

  let increment    = modifyRef (_ + 1) count
  let stopParent   = do
        stopScope parent
        writeRef "parent stopped — attached stops, detached continues" status
  let stopDetached = do
        stopScope detached
        writeRef "both stopped" status

  pure { count, attachedVal, detachedVal, status, increment, stopParent, stopDetached }
</script>

<style scoped>
.meta { font-size: 0.8rem; color: #888; }
</style>
