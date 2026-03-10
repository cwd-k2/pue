<template>
  <div>
    <section class="hero">
      <p class="tagline">PureScript in Vue single-file components</p>
      <p class="subtitle">{{ total }} interactive demos across {{ sections.length }} categories</p>
    </section>
    <div class="sections">
      <router-link v-for="s in sections" :key="s.path" :to="s.path" class="section-card">
        <span class="section-title">{{ s.title }}</span>
        <span class="section-desc">{{ s.desc }}</span>
        <span class="section-count">{{ s.count }}</span>
      </router-link>
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
const total = sections.reduce((a, s) => a + s.count, 0)
</script>

<style scoped>
.hero {
  margin-bottom: 2rem;
}
.tagline {
  font-size: 1.15rem;
  color: var(--c-text-2);
  margin: 0;
}
.subtitle {
  font-size: 0.9rem;
  color: var(--c-text-3);
  margin: 0.25rem 0 0;
}

.sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

.section-card {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.15rem 1rem;
  align-items: start;
  padding: 1rem 1.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
}
.section-card:hover {
  border-color: var(--c-accent);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
}

.section-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--c-text);
}
.section-card:hover .section-title {
  color: var(--c-accent);
}
.section-desc {
  font-size: 0.85rem;
  color: var(--c-text-3);
  grid-column: 1;
}
.section-count {
  grid-row: 1 / -1;
  grid-column: 2;
  align-self: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-border);
  line-height: 1;
}
.section-card:hover .section-count {
  color: var(--c-accent-soft);
}
</style>
