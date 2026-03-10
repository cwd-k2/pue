<template>
  <div>
    <p>Attrs NOT auto-forwarded:</p>
    <pre>{{ JSON.stringify(attrs, null, 2) }}</pre>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (defineOptions, useAttrs)

options = defineOptions { inheritAttrs: false }

setup = do
  attrs <- useAttrs
  pure { attrs }
</script>
