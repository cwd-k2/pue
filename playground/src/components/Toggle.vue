<template>
  <div class="card">
    <h2>Toggle (DSL)</h2>
    <p>{{ label }}</p>
    <button @click="toggle">toggle</button>
  </div>
</template>

<script setup lang="purs">
module Pue.Toggle where

import Prelude
import Effect (Effect)
import Pue (Ref, ref, readRef, writeRef, computed)

on <- ref true
label <- computed do
  v <- readRef on
  pure (if v then "ON" else "OFF")
toggle = do
  v <- readRef on
  writeRef (not v) on
</script>
