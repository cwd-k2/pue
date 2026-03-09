<template>
  <div>
    <h1>{{ greeting }}</h1>
    <p>doubled: {{ doubled }}</p>
  </div>
</template>

<script setup lang="purs">
module Pue.App where

import Prelude

greeting :: String
greeting = "Hello from PureScript!"

doubled :: Int
doubled = 21 * 2
</script>
