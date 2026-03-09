<template>
  <div class="card">
    <h2>Watch</h2>
    <p>count: {{ count }}</p>
    <button @click="increment">+1</button>
    <ul>
      <li v-for="(entry, i) in history" :key="i">{{ entry }}</li>
    </ul>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, modifyRef, watch)

setup = do
  count   <- ref 0
  history <- ref ([] :: Array String)

  _ <- watch count \new old ->
    modifyRef (_ <> [show old <> " → " <> show new]) history

  let increment = modifyRef (_ + 1) count

  pure { count, history, increment }
</script>
