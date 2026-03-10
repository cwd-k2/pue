<template>
  <div id="app">
    <header>
      <h1><router-link to="/" class="logo">pue</router-link> <span class="sub">playground</span></h1>
      <nav>
        <router-link to="/reactivity">Reactivity</router-link>
        <router-link to="/watch">Watch</router-link>
        <router-link to="/lifecycle">Lifecycle</router-link>
        <router-link to="/components">Components</router-link>
        <router-link to="/advanced">Advanced</router-link>
        <router-link to="/router">Router FFI</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: system-ui, sans-serif;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}
header { margin-bottom: 2rem; }
h1 { margin: 0; }
h1 .logo { color: inherit; text-decoration: none; }
h1 .sub { font-weight: 300; color: #888; font-size: 0.8em; }
nav {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}
nav a {
  color: #666;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
nav a:hover { background: #f0f0f0; }
nav a.router-link-active { color: #333; background: #e8e8e8; font-weight: 500; }
h3 {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  color: #444;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.25rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}
.card h2 {
  margin-top: 0;
  font-size: 1.1rem;
}
.card button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
}
.card ul {
  margin: 0.5rem 0 0;
  padding-left: 1.5rem;
  font-size: 0.85rem;
}
</style>
