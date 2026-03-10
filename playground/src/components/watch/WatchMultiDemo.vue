<template>
  <div class="card">
    <h2>Multi-source Watch</h2>
    <label>First <input :value="first" @input="(e) => setFirst(e.target.value)()" /></label>
    <label>Last <input :value="last" @input="(e) => setLast(e.target.value)()" /></label>
    <p>Full: <strong>{{ full }}</strong></p>
    <ul>
      <li v-for="(entry, i) in log" :key="i">{{ entry }}</li>
    </ul>
  </div>
</template>

<script lang="purs">
import Prelude

import Data.Tuple (Tuple(..))
import Pue (Ref, ref, writeRef, modifyRef, watch)

setup = do
  first <- ref "John"
  last  <- ref "Doe"
  log   <- ref ([] :: Array String)

  -- Derived ref via Applicative (no watch needed for display)
  let full = (\f l -> f <> " " <> l) <$> first <*> last

  -- Multi-source watch: fires when either ref changes
  _ <- watch (Tuple <$> first <*> last) \(Tuple f l) (Tuple f' l') ->
    modifyRef (_ <> [f' <> " " <> l' <> " → " <> f <> " " <> l]) log

  let setFirst = \v -> writeRef v first
  let setLast  = \v -> writeRef v last

  pure { first, last, full, log, setFirst, setLast }
</script>
