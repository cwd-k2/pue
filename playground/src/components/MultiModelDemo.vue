<template>
  <div class="card">
    <h2>Multi v-model</h2>
    <MultiModelChild v-model:title="title" v-model:content="content" />
    <hr />
    <p><strong>Title:</strong> {{ title }}</p>
    <p><strong>Content:</strong> {{ content }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MultiModelChild from './MultiModelChild.vue'

const title = ref('Hello')
const content = ref('World')
</script>
