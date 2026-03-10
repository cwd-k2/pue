import * as Vue from "vue";

// Declarations (phantom -- null at runtime)
export const defineComponent = null;
export const defineProps = null;
export const defineEmits = null;
export const defineModel = null;
export const defineExpose = null;
export const defineSlots = null;

// Runtime value declarations (identity)
export const defineOptions = (r) => r;
export const defineDefaults = (r) => r;

// Emit: captures getCurrentInstance().emit during setup.
// The source argument (DefineEmits, null at runtime) is ignored.
export const emitImpl = (name) => (_source) => (value) => {
  const instance = Vue.getCurrentInstance();
  return () => instance.emit(name, value);
};

// Context: provide / inject
export const provideImpl = (key) => (value) => () => Vue.provide(key, value);
export const injectImpl = (key) => (factory) => () => Vue.inject(key, factory, true);
export const hasInjectionContext = () => Vue.hasInjectionContext();

// Props: uses getCurrentInstance().props.
// The source argument (DefineProps, null at runtime) is ignored.
export const toRefImpl = (key) => (_source) => () =>
  Vue.toRef(Vue.getCurrentInstance().props, key);

export const useModelImpl = (_source) => (name) => () =>
  Vue.useModel(Vue.getCurrentInstance().props, name);

// Context: utilities
export const useTemplateRef = (name) => () => Vue.useTemplateRef(name);
export const useSlots = () => Vue.useSlots();
export const useAttrs = () => Vue.useAttrs();
export const useId = () => Vue.useId();
