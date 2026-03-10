<template>
  <div class="card">
    <h2>Custom Directives</h2>
    <p v-color="color">This text changes color</p>
    <input v-focus placeholder="auto-focused on mount" />
    <button @click="toggle">Toggle color</button>
    <p class="meta">v-focus (Semigroup mounted) · v-color (onWith binding)</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, modifyRef)
import Pue.Directive (Directive, Element, mounted, onWith, focus, setStyle)

vFocus :: Directive
vFocus = mounted \el -> focus el

vColor :: Directive
vColor = onWith \el color -> setStyle "color" color el

setup = do
  color <- ref "crimson"
  let toggle = modifyRef (\c -> if c == "crimson" then "dodgerblue" else "crimson") color
  pure { color, toggle }
</script>

<style scoped>
.meta { margin-top: 0.75rem; }
</style>
