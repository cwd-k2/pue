<template>
  <div>
    <h3>Router FFI</h3>
    <p class="desc">
      vue-router is not part of pue — it's integrated via standard PureScript FFI.
      This demonstrates the pattern for any Vue ecosystem library.
    </p>
    <div class="grid">
      <RouterDemo />
    </div>
  </div>
</template>

<script setup>
import RouterDemo from '../components/router/RouterDemo.vue'
</script>

<style scoped>
.desc { color: #666; margin-bottom: 1rem; }
</style>
