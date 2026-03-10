<template>
  <div>
    <p>
      <label>Title: <input :value="title" @input="updateTitle($event.target.value)" /></label>
    </p>
    <p>
      <label>Content: <textarea :value="content" @input="updateContent($event.target.value)" /></label>
    </p>
    <p class="preview">Preview: {{ combined }}</p>
  </div>
</template>

<script lang="purs">
import Prelude

import Pue (Define, define_, toRef)

define :: Define ( model :: { title :: String, content :: String } )
define = define_

setup p emit = do
  titleRef   <- toRef @"title" p
  contentRef <- toRef @"content" p

  let combined      = (\t c -> t <> ": " <> c) <$> titleRef <*> contentRef
  let updateTitle   = emit "update:title"
  let updateContent = emit "update:content"

  pure { combined, updateTitle, updateContent }
</script>

<style scoped>
.preview { font-style: italic; color: #666; }
</style>
