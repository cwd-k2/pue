import { useRouter as _useRouter } from "vue-router";

export const useRouter = () => _useRouter();
export const push = (path) => (router) => () => router.push(path);
export const back = (router) => () => router.back();
