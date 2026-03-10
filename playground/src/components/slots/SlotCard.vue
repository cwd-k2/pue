<template>
  <div class="slot-card">
    <div class="slot-header"><slot name="title">Untitled</slot></div>
    <div class="slot-body"><slot>No content</slot></div>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (DefineSlots, defineSlots, ref, modifyRef)

slots :: DefineSlots { title :: {} }
slots = defineSlots

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
