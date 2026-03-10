<template>
  <div>
    <h3>Router FFI</h3>
    <p class="page-desc">
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
.page-desc {
  color: var(--c-text-3);
  font-size: 0.9rem;
  margin: -0.25rem 0 1.25rem;
}
</style>
