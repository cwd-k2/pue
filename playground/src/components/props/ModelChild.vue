<template>
  <div>
    <p>Child sees: {{ modelValue }}</p>
    <button @click="increment">+1 from child</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Define, define_, readRef, toRef)

define :: Define ( model :: { modelValue :: Int } )
define = define_

setup p emit = do
  modelRef <- toRef @"modelValue" p

  let increment = do
        c <- readRef modelRef
        emit "update:modelValue" (c + 1)

  let reset = emit "update:modelValue" 0

  pure { increment, reset }
</script>
