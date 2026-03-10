import * as Vue from "vue";

export const effectScope = () => Vue.effectScope();
export const effectScopeDetached = () => Vue.effectScope(true);
export const runScope = (scope) => (effect) => () => scope.run(effect);
export const stopScope = (scope) => () => scope.stop();

export const getCurrentScopeImpl = (just) => (nothing) => () => {
  const scope = Vue.getCurrentScope();
  return scope != null ? just(scope) : nothing;
};

export const onScopeDispose = (effect) => () => Vue.onScopeDispose(effect);
