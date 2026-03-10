import * as Vue from "vue";

const mkHandle = (h) => ({
  stop:   () => h(),
  pause:  () => h.pause(),
  resume: () => h.resume(),
});

export const watchImpl = (source) => (callback) => (opts) => () =>
  mkHandle(Vue.watch(source, (n, o) => { callback(n)(o)(); }, opts));

export const watchEffectImpl = (effect) => (flush) => () =>
  mkHandle(Vue.watchEffect(effect, { flush }));

export const onCleanup = (cleanup) => () => Vue.onWatcherCleanup(cleanup);
