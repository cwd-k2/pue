<template>
  <div class="card">
    <h2>Expose Demo</h2>
    <ExposeChild ref="child" />
    <button @click="child?.increment()">Increment from parent</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ExposeChild from './ExposeChild.vue'

const child = ref(null)
</script>
