<template>
  <div>
    <p>Child sees: {{ modelValue }}</p>
    <button @click="increment">+1 from child</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (DefineModel, defineModel, readRef, writeRef, useModel)

model :: DefineModel { modelValue :: Int }
model = defineModel

setup = do
  modelRef <- useModel @"modelValue" model

  let increment = do
        c <- readRef modelRef
        writeRef (c + 1) modelRef

  let reset = writeRef 0 modelRef

  pure { increment, reset }
</script>
