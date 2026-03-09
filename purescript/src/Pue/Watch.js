import * as Vue from "vue";

export const watch = (source) => (callback) => () =>
  Vue.watch(source, (newVal, oldVal) => { callback(newVal)(oldVal)(); });

export const watchImmediate = (source) => (callback) => () =>
  Vue.watch(source, (newVal, oldVal) => { callback(newVal)(oldVal)(); }, { immediate: true });

export const watchWith = (source) => (callback) => () =>
  Vue.watch(source, (newVal, oldVal, onCleanup) => {
    callback(newVal)(oldVal)((cleanup) => () => onCleanup(cleanup))();
  });

export const watchEffect = (effect) => () => Vue.watchEffect(effect);
export const watchPostEffect = (effect) => () => Vue.watchPostEffect(effect);
export const watchSyncEffect = (effect) => () => Vue.watchSyncEffect(effect);
