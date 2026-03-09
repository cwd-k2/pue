<template>
  <div class="card">
    <h2>KeepAlive (onActivated / onDeactivated)</h2>
    <button @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }}</button>
    <KeepAlive>
      <KeepAliveChild v-if="visible" />
    </KeepAlive>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KeepAliveChild from './KeepAliveChild.vue'

const visible = ref(true)
</script>
