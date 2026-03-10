<template>
  <p>Child count: {{ count }}</p>
</template>

<script lang="purs">
import Prelude

import Effect (Effect)
import Pue (DefineExpose, defineExpose, Ref, ref, modifyRef)

expose :: DefineExpose { count :: Ref Int, increment :: Effect Unit }
expose = defineExpose

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
