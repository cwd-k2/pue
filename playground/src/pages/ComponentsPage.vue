<template>
  <div>
    <h3>Props &amp; Emits</h3>
    <div class="grid">
      <PropsDemo />
    </div>
    <h3>v-model</h3>
    <div class="grid">
      <ModelDemo />
      <MultiModelDemo />
    </div>
    <h3>Expose</h3>
    <div class="grid">
      <ExposeDemo />
    </div>
    <h3>Provide / Inject</h3>
    <div class="grid">
      <ProvideInject />
    </div>
    <h3>Slots</h3>
    <div class="grid">
      <SlotDemo />
    </div>
  </div>
</template>

<script setup>
import PropsDemo from '../components/props/PropsDemo.vue'
import ModelDemo from '../components/props/ModelDemo.vue'
import MultiModelDemo from '../components/props/MultiModelDemo.vue'
import ExposeDemo from '../components/props/ExposeDemo.vue'
import ProvideInject from '../components/inject/ProvideInject.vue'
import SlotDemo from '../components/slots/SlotDemo.vue'
</script>
