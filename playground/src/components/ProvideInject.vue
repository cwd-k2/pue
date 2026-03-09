<template>
  <div class="card">
    <h2>Provide / Inject</h2>
    <p>Provider: theme = "dark"</p>
    <InjectedChild />
  </div>
</template>

<script setup lang="purs">
module Pue.ProvideInject where

import Prelude
import Pue (provide)

components = ["InjectedChild"]

setup = do
  provide "theme" "dark"
  pure {}
</script>
