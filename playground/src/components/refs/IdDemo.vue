<template>
  <div class="card">
    <h2>useId Demo</h2>
    <label :for="uid">Name <input :id="uid" placeholder="Accessible input" /></label>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (useId)

setup = do
  uid <- useId
  pure { uid }
</script>
