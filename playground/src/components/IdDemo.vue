<template>
  <div class="card">
    <h2>useId Demo</h2>
    <label :for="uid">Name:</label>
    <input :id="uid" placeholder="Accessible input" />
  </div>
</template>

<script setup lang="purs">
module Pue.IdDemo where

import Prelude
import Pue (useId)

setup = do
  uid <- useId
  pure { uid }
</script>
