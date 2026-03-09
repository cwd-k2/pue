import * as Vue from "vue";

export const effectScope = () => Vue.effectScope();
export const runScope = (scope) => (effect) => () => scope.run(effect);
export const stopScope = (scope) => () => scope.stop();
export const onScopeDispose = (effect) => () => Vue.onScopeDispose(effect);
