<template>
  <div>
    <p>Attrs NOT auto-forwarded:</p>
    <pre>{{ JSON.stringify(attrs) }}</pre>
  </div>
</template>

<script lang="purs">
module Pue.OptionsAttrChild where

import Prelude
import Pue (useAttrs)

options = { inheritAttrs: false }

setup = do
  attrs <- useAttrs
  pure { attrs }
</script>
