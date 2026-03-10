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

import Pue (DefineModel, defineModel, writeRef, useModel)

model :: DefineModel { title :: String, content :: String }
model = defineModel

setup = do
  titleRef   <- useModel @"title" model
  contentRef <- useModel @"content" model

  let combined      = (\t c -> t <> ": " <> c) <$> titleRef <*> contentRef
  let updateTitle   = \v -> writeRef v titleRef
  let updateContent = \v -> writeRef v contentRef

  pure { combined, updateTitle, updateContent }
</script>

<style scoped>
.preview { font-style: italic; color: #666; }
</style>
