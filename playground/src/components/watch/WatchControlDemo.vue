<template>
  <div class="card">
    <h2>Watch Control</h2>
    <p>count: {{ count }}</p>
    <p>tracked: {{ tracked }} <span class="meta">({{ status }})</span></p>
    <button @click="increment">+1</button>
    <button @click="pause">Pause</button>
    <button @click="resume">Resume</button>
    <button @click="stop">Stop</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, writeRef, modifyRef, WatchOptions, watchOptions, watchWith)

setup = do
  count   <- ref 0
  tracked <- ref 0
  status  <- ref "watching"

  handle <- watchWith (watchOptions { immediate = true }) count \new _ ->
    writeRef new tracked

  let increment = modifyRef (_ + 1) count
  let pause     = do handle.pause
                     writeRef "paused" status
  let resume    = do handle.resume
                     writeRef "watching" status
  let stop      = do handle.stop
                     writeRef "stopped" status

  pure { count, tracked, status, increment, pause, resume, stop }
</script>
