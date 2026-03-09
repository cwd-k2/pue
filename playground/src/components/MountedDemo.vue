<template>
  <div class="card">
    <h2>onMounted</h2>
    <input ref="nameInput" v-model="name" placeholder="Your name" />
    <p v-if="greeting">{{ greeting }}</p>
    <p class="meta">auto-focused on mount</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, writeRef, useTemplateRef, onMounted)

setup = do
  name     <- ref ""
  greeting <- ref ""

  nameInput <- useTemplateRef "nameInput"

  onMounted do
    writeRef "Hello, world!" greeting

  pure { name, greeting, nameInput }
</script>

<style scoped>
.meta { font-size: 0.8rem; color: #888; }
</style>
