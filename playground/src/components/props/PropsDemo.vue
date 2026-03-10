<template>
  <div class="card">
    <h2>Props &amp; Emits</h2>
    <p>Parent count: {{ count }}</p>
    <button @click="count++">+1 from parent</button>
    <p v-if="notified" class="notify">Child notified!</p>
    <PropsChild :msg="'hello from parent'" :count="count" @notify="onNotify" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PropsChild from './PropsChild.vue'

const count = ref(0)
const notified = ref(false)

function onNotify() {
  notified.value = true
  setTimeout(() => { notified.value = false }, 1000)
}
</script>

<style scoped>
.notify { color: var(--c-accent); font-weight: 600; font-size: 0.85rem; }
</style>
