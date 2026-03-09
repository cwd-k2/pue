<template>
  <div class="card">
    <h2>customRef</h2>
    <p>value: {{ clamped }}</p>
    <button @click="dec">-10</button>
    <button @click="inc">+10</button>
    <p class="meta">clamped to 0–100 via customRef</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, readRef, writeRef, modifyRef, customRef)

clamp :: Int -> Int -> Int -> Int
clamp lo hi x
  | x < lo   = lo
  | x > hi   = hi
  | otherwise = x

setup = do
  inner <- ref 50

  clamped <- customRef \track trigger ->
    { get: track *> readRef inner
    , set: \v -> writeRef (clamp 0 100 v) inner *> trigger
    }

  let inc = modifyRef (_ + 10) clamped
  let dec = modifyRef (_ - 10) clamped

  pure { clamped, inc, dec }
</script>

<style scoped>
.meta { font-size: 0.8rem; color: #888; }
</style>
