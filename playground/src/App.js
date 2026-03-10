import { createRouter, createWebHashHistory } from "vue-router";

export { default as rootComponent } from "./App.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("./pages/HomePage.vue") },
    { path: "/reactivity", name: "reactivity", component: () => import("./pages/ReactivityPage.vue") },
    { path: "/watch", name: "watch", component: () => import("./pages/WatchPage.vue") },
    { path: "/lifecycle", name: "lifecycle", component: () => import("./pages/LifecyclePage.vue") },
    { path: "/components", name: "components", component: () => import("./pages/ComponentsPage.vue") },
    { path: "/advanced", name: "advanced", component: () => import("./pages/AdvancedPage.vue") },
    { path: "/router", name: "router", component: () => import("./pages/RouterPage.vue") },
  ],
});
