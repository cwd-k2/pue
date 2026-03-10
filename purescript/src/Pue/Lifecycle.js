import * as Vue from "vue";

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

export const onRenderTracked = (handler) => () =>
  Vue.onRenderTracked((e) => handler(e)());

export const onRenderTriggered = (handler) => () =>
  Vue.onRenderTriggered((e) => handler(e)());

export const onServerPrefetch = (effect) => () => Vue.onServerPrefetch(effect);

export const nextTick = (effect) => () => Vue.nextTick(effect);
