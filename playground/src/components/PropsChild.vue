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

import Pue (DefineProps, defineProps, DefineEmits, defineEmits, Ref, toRef)

props :: DefineProps { msg :: String, count :: Int }
props = defineProps

emits :: DefineEmits { notify :: Unit }
emits = defineEmits

setup p emit = do
  countRef <- toRef @"count" p

  let doubled = (_ * 2) <$> countRef
  let notify  = emit "notify" unit

  pure { doubled, notify }
</script>
