<template>
  <p>Injected theme: <strong>{{ theme }}</strong></p>
</template>

<script lang="purs">
import Prelude

import Pue (inject)

setup = do
  theme <- inject @"theme" (pure "default")
  pure { theme }
</script>
