<template>
  <div id="app">
    <h1>pue playground</h1>
    <p class="subtitle">{{ components.length }} components — Vue features in PureScript</p>

    <h3>Reactivity</h3>
    <div class="grid">
      <Counter />
      <DoubleCounter />
      <Fibonacci />
      <Toggle />
      <Stepper />
      <Temperature />
    </div>

    <h3>Algorithms</h3>
    <div class="grid">
      <Collatz />
      <GCD />
    </div>

    <h3>Watch &amp; WatchEffect</h3>
    <div class="grid">
      <WatchDemo />
      <WatchEffectDemo />
    </div>

    <h3>Lifecycle Hooks</h3>
    <div class="grid">
      <Lifecycle />
    </div>

    <h3>Provide / Inject</h3>
    <div class="grid">
      <ProvideInject />
    </div>

    <h3>Props &amp; Emits</h3>
    <div class="grid">
      <PropsDemo />
    </div>

    <h3>v-model</h3>
    <div class="grid">
      <ModelDemo />
      <MultiModelDemo />
    </div>

    <h3>Pure Exports &amp; Options API</h3>
    <div class="grid">
      <Greeting />
      <OptionsDemo />
    </div>
  </div>
</template>

<script setup>
import Counter from './components/Counter.vue'
import DoubleCounter from './components/DoubleCounter.vue'
import Fibonacci from './components/Fibonacci.vue'
import Toggle from './components/Toggle.vue'
import Stepper from './components/Stepper.vue'
import Temperature from './components/Temperature.vue'
import Collatz from './components/Collatz.vue'
import GCD from './components/GCD.vue'
import WatchDemo from './components/WatchDemo.vue'
import WatchEffectDemo from './components/WatchEffectDemo.vue'
import Lifecycle from './components/Lifecycle.vue'
import ProvideInject from './components/ProvideInject.vue'
import PropsDemo from './components/PropsDemo.vue'
import ModelDemo from './components/ModelDemo.vue'
import MultiModelDemo from './components/MultiModelDemo.vue'
import Greeting from './components/Greeting.vue'
import OptionsDemo from './components/OptionsDemo.vue'

const components = [
  'Counter', 'DoubleCounter', 'Fibonacci', 'Toggle', 'Stepper',
  'Temperature', 'Collatz', 'GCD', 'WatchDemo', 'WatchEffectDemo',
  'Lifecycle', 'ProvideInject', 'PropsDemo', 'ModelDemo', 'MultiModelDemo',
  'Greeting', 'OptionsDemo',
]
</script>

<style>
#app {
  font-family: system-ui, sans-serif;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}
h3 {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  color: #444;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.25rem;
}
.subtitle {
  color: #666;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}
.card h2 {
  margin-top: 0;
  font-size: 1.1rem;
}
.card button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
}
.card ul {
  margin: 0.5rem 0 0;
  padding-left: 1.5rem;
  font-size: 0.85rem;
}
</style>
