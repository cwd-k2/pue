<template>
  <div>
    <h3>Watch &amp; WatchEffect</h3>
    <div class="grid">
      <WatchDemo />
      <WatchEffectDemo />
      <WatchPostDemo />
      <WatchMultiDemo />
      <WatchControlDemo />
      <WatchOnceDemo />
    </div>
    <h3>EffectScope</h3>
    <div class="grid">
      <ScopeDemo />
      <DetachedScopeDemo />
    </div>
  </div>
</template>

<script setup>
import WatchDemo from '../components/watch/WatchDemo.vue'
import WatchEffectDemo from '../components/watch/WatchEffectDemo.vue'
import WatchPostDemo from '../components/watch/WatchPostDemo.vue'
import WatchMultiDemo from '../components/watch/WatchMultiDemo.vue'
import WatchControlDemo from '../components/watch/WatchControlDemo.vue'
import WatchOnceDemo from '../components/watch/WatchOnceDemo.vue'
import ScopeDemo from '../components/watch/ScopeDemo.vue'
import DetachedScopeDemo from '../components/watch/DetachedScopeDemo.vue'
</script>
