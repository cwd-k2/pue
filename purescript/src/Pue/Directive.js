export const mergeDirectives = (a) => (b) => ({ ...a, ...b });
export const emptyDirective = {};

export const mounted = (f) => ({ mounted: (el) => f(el)() });
export const mountedWith = (f) => ({ mounted: (el, binding) => f(el)(binding.value)() });
export const updated = (f) => ({ updated: (el) => f(el)() });
export const updatedWith = (f) => ({ updated: (el, binding) => f(el)(binding.value)() });
export const beforeUnmount = (f) => ({ beforeUnmount: (el) => f(el)() });
export const beforeUnmountWith = (f) => ({ beforeUnmount: (el, binding) => f(el)(binding.value)() });
export const unmounted = (f) => ({ unmounted: (el) => f(el)() });
export const unmountedWith = (f) => ({ unmounted: (el, binding) => f(el)(binding.value)() });

// DOM helpers
export const focus = (el) => () => el.focus();
export const blur = (el) => () => el.blur();
export const setStyle = (prop) => (value) => (el) => () => { el.style[prop] = value; };
export const setAttribute = (name) => (value) => (el) => () => el.setAttribute(name, value);
export const addClass = (cls) => (el) => () => el.classList.add(cls);
export const removeClass = (cls) => (el) => () => el.classList.remove(cls);
