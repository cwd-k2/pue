<template>
  <div>
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
  </div>
</template>

<script setup>
import Counter from '../components/reactivity/Counter.vue'
import DoubleCounter from '../components/reactivity/DoubleCounter.vue'
import Fibonacci from '../components/reactivity/Fibonacci.vue'
import Toggle from '../components/reactivity/Toggle.vue'
import Stepper from '../components/reactivity/Stepper.vue'
import Temperature from '../components/reactivity/Temperature.vue'
import Collatz from '../components/reactivity/Collatz.vue'
import GCD from '../components/reactivity/GCD.vue'
</script>
