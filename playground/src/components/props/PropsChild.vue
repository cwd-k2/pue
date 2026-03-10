<template>
  <div class="card">
    <h2>Props Child</h2>
    <p>Message: {{ msg }}</p>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="notify">Notify parent</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Define, define_, toRef)

define :: Define ( props :: { msg :: String, count :: Int }, emits :: { notify :: Unit } )
define = define_

setup p emit = do
  countRef <- toRef @"count" p

  let doubled = (_ * 2) <$> countRef
  let notify  = emit "notify" unit

  pure { doubled, notify }
</script>
