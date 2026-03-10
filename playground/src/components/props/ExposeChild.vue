<template>
  <p>Child count: {{ count }}</p>
</template>

<script lang="purs">
import Prelude

import Effect (Effect)
import Pue (Define, define_, Ref, ref, modifyRef)

define :: Define ( expose :: { count :: Ref Int, increment :: Effect Unit } )
define = define_

setup = do
  count <- ref 0
  let increment = modifyRef (_ + 1) count
  pure { count, increment }
</script>
