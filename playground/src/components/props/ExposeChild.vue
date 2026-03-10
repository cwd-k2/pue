<template>
  <p>Child count: {{ count }}</p>
</template>

<script lang="purs">
import Prelude

import Effect (Effect)
import Pue (DefineComponent, defineComponent, Ref, ref, modifyRef)

define :: DefineComponent ( expose :: { count :: Ref Int, increment :: Effect Unit } )
define = defineComponent

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
