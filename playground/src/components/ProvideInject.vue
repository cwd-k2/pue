<template>
  <div class="card">
    <h2>Provide / Inject</h2>
    <p>Provider: theme = "dark"</p>
    <InjectedChild />
  </div>
</template>

<script setup>
import { provide } from 'vue'
import InjectedChild from './InjectedChild.vue'

provide('theme', 'dark')
</script>
