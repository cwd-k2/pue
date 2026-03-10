<template>
  <div id="app">
    <div class="accent-bar"></div>
    <header>
      <div class="header-row">
        <router-link to="/" class="logo-link">
          <span class="logo">pue</span>
          <span class="logo-dot"></span>
        </router-link>
        <span class="sub">playground</span>
      </div>
      <nav>
        <router-link to="/reactivity">Reactivity</router-link>
        <router-link to="/watch">Watch</router-link>
        <router-link to="/lifecycle">Lifecycle</router-link>
        <router-link to="/components">Components</router-link>
        <router-link to="/advanced">Advanced</router-link>
        <router-link to="/router">Router FFI</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --c-bg: #fafafa;
  --c-surface: #fff;
  --c-border: #e5e5e5;
  --c-border-hover: #ccc;
  --c-text: #1a1a1a;
  --c-text-2: #555;
  --c-text-3: #888;
  --c-accent: #6c5ce7;
  --c-accent-2: #a29bfe;
  --c-accent-soft: #ede9fe;
  --c-accent-hover: #5a4bd5;
  --c-grad: linear-gradient(135deg, #6c5ce7, #a29bfe);
  --c-code-bg: #f3f3f6;
  --radius: 8px;
  --radius-sm: 5px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.08);
  --transition: 150ms ease;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--c-bg);
  color: var(--c-text);
}

#app {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ── Accent Bar ── */

.accent-bar {
  height: 3px;
  background: var(--c-grad);
  margin: 0 -2rem;
}

/* ── Header ── */

header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--c-bg);
  padding: 1.25rem 0 0;
  margin-bottom: 2rem;
}

.header-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.logo-link {
  display: inline-flex;
  align-items: baseline;
  text-decoration: none;
  gap: 0;
}

.logo {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: var(--c-grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-accent-2);
  display: inline-block;
  margin-left: 1px;
  margin-bottom: 2px;
  vertical-align: baseline;
  transition: background var(--transition);
}

.logo-link:hover .logo-dot {
  background: var(--c-accent);
}

.sub { font-weight: 300; color: var(--c-text-3); font-size: 0.95rem; }

nav {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--c-border);
  flex-wrap: wrap;
}

nav a {
  color: var(--c-text-3);
  text-decoration: none;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 450;
  transition: color var(--transition), background var(--transition);
}
nav a:hover {
  color: var(--c-text-2);
  background: var(--c-border);
}
nav a.router-link-active {
  color: var(--c-accent);
  background: var(--c-accent-soft);
  font-weight: 550;
}

/* ── Section Headers ── */

h3 {
  margin: 2.5rem 0 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c-text-3);
}

/* ── Grid ── */

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* ── Card ── */

.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition), border-color var(--transition);
}
.card:hover {
  border-color: var(--c-border-hover);
  box-shadow: var(--shadow-card-hover);
}

.card h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.card p { margin: 0.35rem 0; }

/* ── Buttons ── */

.card button {
  display: inline-flex;
  align-items: center;
  margin-right: 0.35rem;
  margin-bottom: 0.35rem;
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  font-family: inherit;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
  color: var(--c-text);
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}
.card button:hover {
  border-color: var(--c-border-hover);
  background: var(--c-bg);
}
.card button:active {
  background: var(--c-border);
}

/* ── Inputs ── */

.card input,
.card textarea,
.card select {
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
  color: var(--c-text);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.card input:focus,
.card textarea:focus,
.card select:focus {
  outline: none;
  border-color: var(--c-accent);
  box-shadow: 0 0 0 2px var(--c-accent-soft);
}

/* ── Code ── */

code {
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 0.85em;
  background: var(--c-code-bg);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
}

/* ── Lists ── */

.card ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: var(--c-text-2);
}
.card li { padding: 0.1rem 0; }

/* ── Utility ── */

.meta {
  font-size: 0.8rem;
  color: var(--c-text-3);
}
</style>
