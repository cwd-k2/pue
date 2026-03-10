<template>
  <div>
    <h3>Ref Variants</h3>
    <div class="grid">
      <TemplateRefDemo />
      <CustomRefDemo />
      <IdDemo />
    </div>
    <h3>Error Handling</h3>
    <div class="grid">
      <ErrorDemo />
    </div>
    <h3>Custom Directives</h3>
    <div class="grid">
      <DirectiveDemo />
    </div>
    <h3>Pure Exports &amp; Options API</h3>
    <div class="grid">
      <Greeting />
      <OptionsDemo />
      <OptionsAttrDemo />
    </div>
  </div>
</template>

<script setup>
import TemplateRefDemo from '../components/refs/TemplateRefDemo.vue'
import CustomRefDemo from '../components/refs/CustomRefDemo.vue'
import IdDemo from '../components/refs/IdDemo.vue'
import ErrorDemo from '../components/errors/ErrorDemo.vue'
import DirectiveDemo from '../components/directives/DirectiveDemo.vue'
import Greeting from '../components/misc/Greeting.vue'
import OptionsDemo from '../components/misc/OptionsDemo.vue'
import OptionsAttrDemo from '../components/misc/OptionsAttrDemo.vue'
</script>
