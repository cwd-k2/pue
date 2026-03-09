<template>
  <div class="card">
    <h2>Toggle</h2>
    <p>{{ label }}</p>
    <button @click="toggle">toggle</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Ref, ref, modifyRef)

setup = do
  on <- ref true

  let label  = (\v -> if v then "ON" else "OFF") <$> on
  let toggle = modifyRef not on

  pure { on, label, toggle }
</script>
