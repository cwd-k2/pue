import * as Vue from "vue";

// Layer 0: Algebra — Ref as Functor / Apply / Applicative

export const mapRef = (f) => (r) => Vue.computed(() => f(r.value));
export const applyRef = (fRef) => (aRef) => Vue.computed(() => fRef.value(aRef.value));
export const pureRef = (val) => Vue.computed(() => val);

// Layer 1: Ref Primitives — Construction, Read, Write, Trigger

// Construct
export const ref = (val) => () => Vue.ref(val);
export const shallowRef = (val) => () => Vue.shallowRef(val);
export const computed = (getter) => () => Vue.computed(getter);
export const customRef = (factory) => () => Vue.customRef((track, trigger) => {
  const accessors = factory(() => { track(); })(() => { trigger(); });
  return {
    get() { return accessors.get(); },
    set(newValue) { accessors.set(newValue)(); },
  };
});
export const toRef = (obj) => (key) => () => Vue.toRef(obj, key);
export const useTemplateRef = (name) => () => Vue.useTemplateRef(name);
export const useModel = (props) => (name) => () => Vue.useModel(props, name);

// Read
export const readRef = (r) => () => r.value;

// Write
export const writeRef = (val) => (r) => () => { r.value = val; };
export const modifyRef = (f) => (r) => () => { r.value = f(r.value); };
export const triggerRef = (r) => () => Vue.triggerRef(r);

// Layer 2: Subscriptions — Reactive, Lifecycle, Temporal, Scope

// Reactive
export const watch = (source) => (callback) => () => {
  Vue.watch(source, (newVal, oldVal) => { callback(newVal)(oldVal)(); });
};
export const watchEffect = (effect) => () => Vue.watchEffect(effect);
export const watchPostEffect = (effect) => () => Vue.watchPostEffect(effect);
export const watchSyncEffect = (effect) => () => Vue.watchSyncEffect(effect);

// Lifecycle
export const onBeforeMount = (effect) => () => Vue.onBeforeMount(effect);
export const onMounted = (effect) => () => Vue.onMounted(effect);
export const onBeforeUpdate = (effect) => () => Vue.onBeforeUpdate(effect);
export const onUpdated = (effect) => () => Vue.onUpdated(effect);
export const onBeforeUnmount = (effect) => () => Vue.onBeforeUnmount(effect);
export const onUnmounted = (effect) => () => Vue.onUnmounted(effect);
export const onActivated = (effect) => () => Vue.onActivated(effect);
export const onDeactivated = (effect) => () => Vue.onDeactivated(effect);
export const onErrorCaptured = (handler) => () => {
  Vue.onErrorCaptured((err) => handler(err)());
};

// Temporal
export const nextTick = (effect) => () => Vue.nextTick(effect);

// Scope
export const effectScope = () => Vue.effectScope();
export const runScope = (scope) => (effect) => () => scope.run(effect);
export const stopScope = (scope) => () => scope.stop();
export const onScopeDispose = (effect) => () => Vue.onScopeDispose(effect);

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
