<template>
  <div class="card">
    <h2>Greeting (pure)</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="purs">
import Prelude

message :: String
message = "Hello from pure PureScript — no Effect needed!"
</script>
