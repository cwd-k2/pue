import * as Vue from "vue";

// Layer 0: Algebra — Ref as Functor / Apply / Applicative

export const mapRef = (f) => (r) => Vue.computed(() => f(r.value));
export const applyRef = (fRef) => (aRef) => Vue.computed(() => fRef.value(aRef.value));
export const pureRef = (val) => Vue.computed(() => val);

// Layer 1: Ref Primitives — Construction, Read, Write

// Construct
export const ref = (val) => () => Vue.ref(val);
export const shallowRef = (val) => () => Vue.shallowRef(val);
export const computed = (getter) => () => Vue.computed(getter);
export const toRef = (obj) => (key) => () => Vue.toRef(obj, key);
export const useTemplateRef = (name) => () => Vue.useTemplateRef(name);

// Read
export const readRef = (r) => () => r.value;

// Write
export const writeRef = (val) => (r) => () => { r.value = val; };
export const modifyRef = (f) => (r) => () => { r.value = f(r.value); };

// Layer 2: Subscriptions — Reactive, Lifecycle, Temporal

// Reactive
export const watch = (source) => (callback) => () => {
  Vue.watch(source, (newVal, oldVal) => { callback(newVal)(oldVal)(); });
};
export const watchEffect = (effect) => () => Vue.watchEffect(effect);

// Lifecycle
export const onBeforeMount = (effect) => () => Vue.onBeforeMount(effect);
export const onMounted = (effect) => () => Vue.onMounted(effect);
export const onBeforeUpdate = (effect) => () => Vue.onBeforeUpdate(effect);
export const onUpdated = (effect) => () => Vue.onUpdated(effect);
export const onBeforeUnmount = (effect) => () => Vue.onBeforeUnmount(effect);
export const onUnmounted = (effect) => () => Vue.onUnmounted(effect);
export const onErrorCaptured = (handler) => () => {
  Vue.onErrorCaptured((err) => handler(err)());
};

// Temporal
export const nextTick = (effect) => () => Vue.nextTick(effect);

// Layer 3: Component Interface — Declarations, Context

// Declarations (phantom — null at runtime)
export const defineProps = null;
export const defineEmits = null;
export const defineModel = null;
export const defineExpose = null;
export const defineSlots = null;

// Context
export const provide = (key) => (value) => () => Vue.provide(key, value);
export const inject = (key) => (defaultVal) => () => Vue.inject(key, defaultVal);
export const useSlots = () => Vue.useSlots();
export const useAttrs = () => Vue.useAttrs();
export const useId = () => Vue.useId();
