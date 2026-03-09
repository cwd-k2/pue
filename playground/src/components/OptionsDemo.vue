<template>
  <div class="card">
    <h2>Options API Demo</h2>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, modifyRef)

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
