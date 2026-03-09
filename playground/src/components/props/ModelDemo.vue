<template>
  <div class="card">
    <h2>v-model</h2>
    <p>Parent value: {{ value }}</p>
    <ModelChild v-model="value" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ModelChild from './ModelChild.vue'

const value = ref(0)
</script>
