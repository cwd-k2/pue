<template>
  <div class="card">
    <h2>Toggle</h2>
    <p>{{ label }}</p>
    <button @click="toggle">toggle</button>
  </div>
</template>

<script lang="purs">
module Pue.Toggle where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, writeRef, computed)

setup = do
  on <- ref true
  label <- computed do
    v <- readRef on
    pure (if v then "ON" else "OFF")
  let toggle = do
        v <- readRef on
        writeRef (not v) on
  pure { on, label, toggle }
</script>
