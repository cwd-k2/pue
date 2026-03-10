<template>
  <div>
    <p class="subtitle">34 components demonstrating Vue features written in PureScript</p>
    <div class="grid">
      <div class="card" v-for="s in sections" :key="s.path">
        <h2><router-link :to="s.path">{{ s.title }}</router-link></h2>
        <p>{{ s.desc }}</p>
        <p class="meta">{{ s.count }} demos</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const sections = [
  { path: '/reactivity', title: 'Reactivity', desc: 'ref, computed, derived state, algorithms', count: 8 },
  { path: '/watch', title: 'Watch & Scope', desc: 'watch, watchEffect, effectScope', count: 8 },
  { path: '/lifecycle', title: 'Lifecycle', desc: 'mount, update, keepalive hooks', count: 3 },
  { path: '/components', title: 'Component API', desc: 'props, emits, model, expose, slots, inject', count: 6 },
  { path: '/advanced', title: 'Advanced', desc: 'template refs, errors, directives, options', count: 8 },
  { path: '/router', title: 'Router FFI', desc: 'vue-router integration via PureScript FFI', count: 1 },
]
</script>

<style scoped>
.subtitle { color: #666; }
.meta { font-size: 0.8rem; color: #888; }
.card a { color: inherit; }
</style>
