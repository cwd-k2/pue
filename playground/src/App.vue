<template>
  <div id="app">
    <h1>pue playground</h1>
    <p class="subtitle">{{ components.length }} components — PureScript in Vue SFCs</p>
    <div class="grid">
      <Counter />
      <DoubleCounter />
      <Fibonacci />
      <Toggle />
      <Stepper />
      <Temperature />
      <Collatz />
      <Greeting />
      <GCD />
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
import Greeting from './components/Greeting.vue'
import GCD from './components/GCD.vue'
import OptionsDemo from './components/OptionsDemo.vue'

const components = [
  'Counter', 'DoubleCounter', 'Fibonacci', 'Toggle', 'Stepper',
  'Temperature', 'Collatz', 'Greeting', 'GCD', 'OptionsDemo',
]
</script>

<style>
#app {
  font-family: system-ui, sans-serif;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}
.subtitle {
  color: #666;
  margin-bottom: 2rem;
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
</style>
