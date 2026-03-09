<template>
  <ErrorBoundary>
    <div class="card">
      <h2>Error Demo</h2>
      <p>This content is wrapped in an ErrorBoundary.</p>
      <p>Child errors will be caught and displayed.</p>
    </div>
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from './ErrorBoundary.vue'
</script>
