<template>
  <div class="card">
    <h2>Error Boundary</h2>
    <p v-if="error">Caught error: {{ error }}</p>
    <slot v-else />
  </div>
</template>

<script lang="purs">
module Pue.ErrorBoundary where

import Prelude
import Pue (Ref, ref, writeRef, onErrorCaptured)

setup = do
  error <- ref ""
  onErrorCaptured \err -> do
    writeRef "Something went wrong!" error
    pure true
  pure { error }
</script>
