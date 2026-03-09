// Volar language plugin for pue
// Handles <script lang="purs"> blocks in Vue SFCs by providing
// virtual code that Volar can work with.

/** @type {import('@volar/language-core').LanguagePlugin} */
module.exports = {
  getLanguageId(scriptId) {
    // Not used for embedded blocks
    return undefined
  },

  createVirtualCode(scriptId, languageId, snapshot) {
    // This plugin handles Vue SFCs with embedded PureScript
    // For now, we replace PureScript blocks with empty JS so Volar
    // doesn't report errors on PureScript syntax.
    // Full LSP integration would forward requests to purescript-language-server.
    return undefined
  },

  typescript: {
    extraFileExtensions: [],
    resolveLanguageServiceHost(host) {
      return host
    },
  },
}
