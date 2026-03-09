<template>
  <div class="card">
    <h2>WatchEffect</h2>
    <p>count: {{ count }}</p>
    <p>parity: {{ parity }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script lang="purs">
module Pue.WatchEffectDemo where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, writeRef, modifyRef, watchEffect)

setup = do
  count <- ref 0
  parity <- ref "even"
  _ <- watchEffect do
    c <- readRef count
    writeRef (if mod c 2 == 0 then "even" else "odd") parity
  let increment = modifyRef (_ + 1) count
  pure { count, parity, increment }
</script>
