<template>
  <div class="card">
    <h2>Fibonacci</h2>
    <p>n={{ n }} → fib={{ fibVal }}</p>
    <button @click="next">next</button>
    <button @click="reset">reset</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, writeRef, modifyRef)
import Lib.Numeric (fib)

setup = do
  n <- ref 0

  let fibVal = fib <$> n
  let next   = modifyRef (_ + 1) n
  let reset  = writeRef 0 n

  pure { n, fibVal, next, reset }
</script>
