<template>
  <div class="card">
    <h2>Greeting (pure)</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="purs">
module Pue.Greeting where

message :: String
message = "Hello from pure PureScript — no Effect needed!"
</script>
