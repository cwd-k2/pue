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

// Context: provide / inject
export const provideImpl = (key) => (value) => () => Vue.provide(key, value);
export const injectImpl = (key) => (defaultVal) => () => Vue.inject(key, defaultVal);

// Context: ref from reactive object
export const toRefImpl = (key) => (obj) => () => Vue.toRef(obj, key);
export const useModelImpl = (props) => (name) => () => Vue.useModel(props, name);

// Context: utilities
export const useTemplateRef = (name) => () => Vue.useTemplateRef(name);
export const useSlots = () => Vue.useSlots();
export const useAttrs = () => Vue.useAttrs();
export const useId = () => Vue.useId();
