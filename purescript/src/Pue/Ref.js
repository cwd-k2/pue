import * as Vue from "vue";

// Algebra — Ref as Functor / Apply / Applicative
export const mapRef = (f) => (r) => Vue.computed(() => f(r.value));
export const applyRef = (fRef) => (aRef) => Vue.computed(() => fRef.value(aRef.value));
export const pureRef = (val) => Vue.computed(() => val);

// Construction
export const ref = (val) => () => Vue.ref(val);
export const shallowRef = (val) => () => Vue.shallowRef(val);
export const computed = (getter) => () => Vue.computed(getter);
export const computedGetSet = (getter) => (setter) => () =>
  Vue.computed({ get: getter, set: (v) => setter(v)() });
export const customRef = (factory) => () => Vue.customRef((track, trigger) => {
  const accessors = factory(() => { track(); })(() => { trigger(); });
  return {
    get() { return accessors.get(); },
    set(newValue) { accessors.set(newValue)(); },
  };
});

// Read
export const readRef = (r) => () => r.value;

// Write
export const writeRef = (val) => (r) => () => { r.value = val; };
export const modifyRef = (f) => (r) => () => { r.value = f(r.value); };
export const triggerRef = (r) => () => Vue.triggerRef(r);

// View
export const readonly = (r) => Vue.readonly(r);
