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

// Emit: captures getCurrentInstance() eagerly at phantom-handle application,
// not at value application time, so that partial application during setup
// (e.g. `let notify = emit @"notify" emits`) is safe for later invocation.
export const emitImpl = (name) => (_source) => {
  const instance = Vue.getCurrentInstance();
  return (value) => () => instance.emit(name, value);
};

// Context: provide / inject
export const provideImpl = (key) => (value) => () => Vue.provide(key, value);
export const injectImpl = (key) => (factory) => () => Vue.inject(key, factory, true);
export const hasInjectionContext = () => Vue.hasInjectionContext();

// Props: captures getCurrentInstance().props eagerly at phantom-handle
// application, matching the emit pattern.
export const toRefImpl = (key) => (_source) => {
  const props = Vue.getCurrentInstance().props;
  return () => Vue.toRef(props, key);
};

export const useModelImpl = (_source) => (name) => {
  const props = Vue.getCurrentInstance().props;
  return () => Vue.useModel(props, name);
};

// Context: utilities
export const useTemplateRef = (name) => () => Vue.useTemplateRef(name);
export const useSlots = () => Vue.useSlots();
export const useAttrs = () => Vue.useAttrs();
export const useId = () => Vue.useId();
