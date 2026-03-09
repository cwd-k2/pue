import * as Vue from "vue";

export const ref = (val) => () => Vue.ref(val);
export const readRef = (r) => () => r.value;
export const writeRef = (val) => (r) => () => { r.value = val; };
export const modifyRef = (f) => (r) => () => { r.value = f(r.value); };
export const computed = (getter) => () => Vue.computed(getter);
export const onMounted = (effect) => () => Vue.onMounted(effect);
export const onUnmounted = (effect) => () => Vue.onUnmounted(effect);
