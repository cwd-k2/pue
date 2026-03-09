// Volar configuration for pue
// Place this file in your project root (next to tsconfig.json)
// This tells Volar to treat <script lang="purs"> blocks as embedded PureScript.

module.exports = {
  plugins: [
    // Register pue as a language plugin for Volar
    require.resolve('pue/editor/volar-plugin'),
  ],
}
