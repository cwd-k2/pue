<template>
  <div>
    <h1>pue counter</h1>
    <p>count: {{ count }}</p>
    <p>doubled: {{ doubled }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup lang="purs">
module Pue.App where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, modifyRef, computed)

setup :: Effect { count :: Ref Int, doubled :: Ref Int, increment :: Effect Unit, decrement :: Effect Unit }
setup = do
  count <- ref 0
  doubled <- computed do
    c <- readRef count
    pure (c * 2)
  let increment = modifyRef (_ + 1) count
  let decrement = modifyRef (_ - 1) count
  pure { count, doubled, increment, decrement }
</script>
