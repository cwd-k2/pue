<template>
  <div class="card">
    <h2>Slot Demo</h2>
    <SlotCard>
      <template #title>Custom Title via Slot</template>
      <p>This content is passed through the default slot.</p>
    </SlotCard>
  </div>
</template>

<script setup>
import SlotCard from './SlotCard.vue'
</script>
