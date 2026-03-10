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

import Pue (ref, writeRef, readRef, useTemplateRef, onMounted)
import Pue.Directive (Element, focus)

setup = do
  name     <- ref ""
  greeting <- ref ""

  nameInput <- useTemplateRef "nameInput"

  onMounted do
    writeRef "Hello, world!" greeting
    el <- readRef nameInput
    focus el

  pure { name, greeting, nameInput }
</script>
