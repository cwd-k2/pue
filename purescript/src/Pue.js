import * as Vue from "vue";

export const ref = (val) => () => Vue.ref(val);
export const readRef = (r) => () => r.value;
export const writeRef = (val) => (r) => () => { r.value = val; };
export const modifyRef = (f) => (r) => () => { r.value = f(r.value); };
export const computed = (getter) => () => Vue.computed(getter);
export const watch = (source) => (callback) => () => {
  Vue.watch(source, (newVal, oldVal) => { callback(newVal)(oldVal)(); });
};
export const watchEffect = (effect) => () => Vue.watchEffect(effect);
export const onBeforeMount = (effect) => () => Vue.onBeforeMount(effect);
export const onMounted = (effect) => () => Vue.onMounted(effect);
export const onBeforeUpdate = (effect) => () => Vue.onBeforeUpdate(effect);
export const onUpdated = (effect) => () => Vue.onUpdated(effect);
export const onBeforeUnmount = (effect) => () => Vue.onBeforeUnmount(effect);
export const onUnmounted = (effect) => () => Vue.onUnmounted(effect);
export const provide = (key) => (value) => () => Vue.provide(key, value);
export const inject = (key) => (defaultVal) => () => Vue.inject(key, defaultVal);
export const nextTick = (effect) => () => Vue.nextTick(effect);
export const shallowRef = (val) => () => Vue.shallowRef(val);
export const toRef = (obj) => (key) => () => Vue.toRef(obj, key);
export const defineProps = null;
export const defineEmits = null;
export const defineModel = null;
