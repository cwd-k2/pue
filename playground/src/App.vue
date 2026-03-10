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
      <WatchPostDemo />
      <WatchMultiDemo />
      <WatchControlDemo />
      <WatchOnceDemo />
    </div>

    <h3>EffectScope</h3>
    <div class="grid">
      <ScopeDemo />
      <DetachedScopeDemo />
    </div>

    <h3>Lifecycle Hooks</h3>
    <div class="grid">
      <MountedDemo />
      <LifecycleDemo />
      <KeepAliveDemo />
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

    <h3>Pure Exports &amp; Options API</h3>
    <div class="grid">
      <Greeting />
      <OptionsDemo />
      <OptionsAttrDemo />
    </div>
  </div>
</template>

<script setup>
// Reactivity
import Counter from './components/reactivity/Counter.vue'
import DoubleCounter from './components/reactivity/DoubleCounter.vue'
import Fibonacci from './components/reactivity/Fibonacci.vue'
import Toggle from './components/reactivity/Toggle.vue'
import Stepper from './components/reactivity/Stepper.vue'
import Temperature from './components/reactivity/Temperature.vue'
import Collatz from './components/reactivity/Collatz.vue'
import GCD from './components/reactivity/GCD.vue'

// Watch
import WatchDemo from './components/watch/WatchDemo.vue'
import WatchEffectDemo from './components/watch/WatchEffectDemo.vue'
import WatchPostDemo from './components/watch/WatchPostDemo.vue'
import WatchMultiDemo from './components/watch/WatchMultiDemo.vue'
import WatchControlDemo from './components/watch/WatchControlDemo.vue'
import WatchOnceDemo from './components/watch/WatchOnceDemo.vue'
import ScopeDemo from './components/watch/ScopeDemo.vue'
import DetachedScopeDemo from './components/watch/DetachedScopeDemo.vue'

// Lifecycle
import MountedDemo from './components/lifecycle/MountedDemo.vue'
import LifecycleDemo from './components/lifecycle/LifecycleDemo.vue'
import KeepAliveDemo from './components/lifecycle/KeepAliveDemo.vue'

// Props / Model / Expose
import PropsDemo from './components/props/PropsDemo.vue'
import ModelDemo from './components/props/ModelDemo.vue'
import MultiModelDemo from './components/props/MultiModelDemo.vue'
import ExposeDemo from './components/props/ExposeDemo.vue'

// Context
import ProvideInject from './components/inject/ProvideInject.vue'
import SlotDemo from './components/slots/SlotDemo.vue'

// Refs
import TemplateRefDemo from './components/refs/TemplateRefDemo.vue'
import CustomRefDemo from './components/refs/CustomRefDemo.vue'
import IdDemo from './components/refs/IdDemo.vue'

// Errors
import ErrorDemo from './components/errors/ErrorDemo.vue'

// Misc
import Greeting from './components/misc/Greeting.vue'
import OptionsDemo from './components/misc/OptionsDemo.vue'
import OptionsAttrDemo from './components/misc/OptionsAttrDemo.vue'

const components = [
  'Counter', 'DoubleCounter', 'Fibonacci', 'Toggle', 'Stepper',
  'Temperature', 'Collatz', 'GCD', 'WatchDemo', 'WatchEffectDemo',
  'WatchPostDemo', 'WatchMultiDemo', 'WatchControlDemo', 'WatchOnceDemo',
  'ScopeDemo', 'DetachedScopeDemo', 'MountedDemo', 'LifecycleDemo',
  'KeepAliveDemo', 'ProvideInject', 'PropsDemo', 'ModelDemo',
  'MultiModelDemo', 'ExposeDemo', 'SlotDemo', 'TemplateRefDemo',
  'CustomRefDemo', 'IdDemo', 'ErrorDemo',
  'Greeting', 'OptionsDemo', 'OptionsAttrDemo',
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
