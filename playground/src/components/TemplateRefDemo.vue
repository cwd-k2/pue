<template>
  <div class="card">
    <h2>Template Ref Demo</h2>
    <input ref="inputEl" placeholder="Focus me!" />
    <button @click="inputEl?.focus()">Focus input</button>
  </div>
</template>

<script setup lang="purs">
module Pue.TemplateRefDemo where

import Prelude
import Pue (useTemplateRef)

setup = do
  inputEl <- useTemplateRef "inputEl"
  pure { inputEl }
</script>
