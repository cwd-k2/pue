<template>
  <div class="card">
    <h2>Options Attr Demo</h2>
    <p>Parent passes class="highlight" and data-info="test":</p>
    <OptionsAttrChild class="highlight" data-info="test" />
  </div>
</template>

<script setup>
import OptionsAttrChild from './OptionsAttrChild.vue'
</script>
