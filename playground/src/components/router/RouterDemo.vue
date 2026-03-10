<template>
  <div class="card">
    <h2>Router (FFI)</h2>
    <p>path: <code>{{ $route.path }}</code></p>
    <p>name: <code>{{ $route.name }}</code></p>
    <button @click="goReactivity">→ Reactivity</button>
    <button @click="goWatch">→ Watch</button>
    <button @click="goBack">← Back</button>
    <p class="meta">
      Programmatic navigation via PureScript FFI —
      see <code>src/Lib/Router.purs</code> + <code>src/Lib/Router.js</code>
    </p>
  </div>
</template>

<script lang="purs">
import Prelude

import Lib.Router (useRouter, push, back)

setup = do
  router <- useRouter
  let goReactivity = push "/reactivity" router
  let goWatch      = push "/watch" router
  let goBack       = back router
  pure { goReactivity, goWatch, goBack }
</script>

<style scoped>
.meta { margin-top: 0.75rem; }
</style>
