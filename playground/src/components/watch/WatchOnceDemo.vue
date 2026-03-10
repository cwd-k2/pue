<template>
  <div class="card">
    <h2>Watch Once</h2>
    <p>count: {{ count }}</p>
    <p>captured: {{ captured }}</p>
    <button @click="increment">+1</button>
    <p class="meta">watcher fires only on the first change</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, writeRef, modifyRef, WatchOptions, watchOptions, watchWith)

setup = do
  count    <- ref 0
  captured <- ref "—"

  _ <- watchWith (watchOptions { once = true }) count \new _ ->
    writeRef ("captured " <> show new) captured

  let increment = modifyRef (_ + 1) count

  pure { count, captured, increment }
</script>
