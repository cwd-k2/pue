import * as Vue from "vue";

export const createApp = (component) => () => Vue.createApp(component);
export const mount = (selector) => (app) => () => app.mount(selector);
export const use = (plugin) => (app) => () => app.use(plugin);
export const directive = (name) => (def) => (app) => () => app.directive(name, def);
