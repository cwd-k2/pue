import * as Vue from "vue";

const mkHandle = (h) => ({
  stop:   () => h(),
  pause:  () => h.pause(),
  resume: () => h.resume(),
});

export const watchImpl = (source) => (callback) => (opts) => () =>
  mkHandle(Vue.watch(source, (n, o) => { callback(n)(o)(); }, opts));

export const watch2Impl = (s1) => (s2) => (callback) => (opts) => () =>
  mkHandle(Vue.watch([s1, s2], ([n1, n2], [o1, o2]) => {
    callback(n1)(n2)(o1)(o2)();
  }, opts));

export const watch3Impl = (s1) => (s2) => (s3) => (callback) => (opts) => () =>
  mkHandle(Vue.watch([s1, s2, s3], ([n1, n2, n3], [o1, o2, o3]) => {
    callback(n1)(n2)(n3)(o1)(o2)(o3)();
  }, opts));

export const watchEffectImpl = (effect) => (flush) => () =>
  mkHandle(Vue.watchEffect(effect, { flush }));

export const onCleanup = (cleanup) => () => Vue.onWatcherCleanup(cleanup);
