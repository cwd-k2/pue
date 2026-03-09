<template>
  <div class="card">
    <h2>EffectScope</h2>
    <p>count: {{ count }}</p>
    <p>tracked: {{ tracked }}</p>
    <button @click="increment">+1</button>
    <button @click="stop">Stop scope</button>
    <p class="meta">{{ status }}</p>
  </div>
</template>

<script lang="purs">
module Pue.ScopeDemo where

import Prelude
import Pue (Ref, ref, readRef, writeRef, modifyRef, watchEffect, effectScope, runScope, stopScope, onScopeDispose)
import Effect (Effect)

setup = do
  count <- ref 0
  tracked <- ref 0
  status <- ref "scope active"
  scope <- effectScope
  runScope scope do
    _ <- watchEffect do
      c <- readRef count
      writeRef c tracked
    onScopeDispose do
      writeRef "scope stopped — tracking disabled" status
  let increment = modifyRef (_ + 1) count
  let stop = stopScope scope
  pure { count, tracked, increment, stop, status }
</script>

<style scoped>
.meta { font-size: 0.8rem; color: #888; }
</style>
