<template>
  <div class="card">
    <h2>Collatz</h2>
    <p>current: {{ current }} (steps: {{ steps }})</p>
    <button @click="step">step</button>
    <button @click="reset">reset to 27</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, readRef, writeRef, modifyRef)
import Lib.Numeric (collatzStep)

setup = do
  current <- ref 27
  steps   <- ref 0

  let step = do
        c <- readRef current
        when (c > 1) do
          writeRef (collatzStep c) current
          modifyRef (_ + 1) steps

  let reset = do
        writeRef 27 current
        writeRef 0 steps

  pure { current, steps, step, reset }
</script>
