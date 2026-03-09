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
module Pue.PropsChild where

import Prelude
import Pue (DefineProps, defineProps, DefineEmits, defineEmits, Ref, computed, readRef, toRef)

props :: DefineProps { msg :: String, count :: Int }
props = defineProps

emits :: DefineEmits { notify :: Unit }
emits = defineEmits

setup p emit = do
  countRef <- toRef p "count"
  doubled <- computed do
    c <- readRef countRef
    pure (c * 2)
  let notify = emit "notify" unit
  pure { doubled, notify }
</script>
