<template>
  <div class="card">
    <h2>Provide / Inject</h2>
    <p>Provider: theme = "dark"</p>
    <InjectedChild />
  </div>
</template>

<script>
import InjectedChild from './InjectedChild.vue'
</script>

<script lang="purs">
import Prelude

import Pue (provide)

setup = do
  provide @"theme" "dark"
  pure {}
</script>
