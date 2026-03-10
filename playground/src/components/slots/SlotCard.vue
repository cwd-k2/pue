<template>
  <div class="slot-card">
    <div class="slot-header"><slot name="title">Untitled</slot></div>
    <div class="slot-body"><slot>No content</slot></div>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (DefineComponent, defineComponent, ref, modifyRef)

define :: DefineComponent ( slots :: { title :: {} } )
define = defineComponent

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>

<style scoped>
.slot-card { border: 1px dashed #aaa; border-radius: 8px; padding: 0.5rem 1rem; }
.slot-header { font-weight: bold; margin-bottom: 0.5rem; }
</style>
