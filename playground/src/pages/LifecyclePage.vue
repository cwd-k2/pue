<template>
  <div>
    <h3>Lifecycle Hooks</h3>
    <div class="grid">
      <MountedDemo />
      <LifecycleDemo />
      <KeepAliveDemo />
    </div>
  </div>
</template>

<script setup>
import MountedDemo from '../components/lifecycle/MountedDemo.vue'
import LifecycleDemo from '../components/lifecycle/LifecycleDemo.vue'
import KeepAliveDemo from '../components/lifecycle/KeepAliveDemo.vue'
</script>
