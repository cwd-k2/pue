# Editor Support

## Neovim

### Syntax highlighting

Requires [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) with the PureScript parser:

```vim
:TSInstall purescript
```

Copy the injection query to your Neovim config:

```bash
mkdir -p ~/.config/nvim/after/queries/vue
cp node_modules/pue/editor/neovim/queries/vue/injections.scm \
   ~/.config/nvim/after/queries/vue/injections.scm
```

This tells Tree-sitter to parse `<script lang="purs">` blocks as PureScript.

### LSP

Add to your `init.lua` or plugin config:

```lua
require('pue.editor.neovim.pue').setup()
```

Or configure manually:

```lua
require('lspconfig').purescriptls.setup({
  cmd = { "purescript-language-server", "--stdio" },
  filetypes = { "purescript" },
  root_dir = require('lspconfig').util.root_pattern("spago.dhall", "spago.yaml"),
  settings = {
    purescript = {
      formatter = "purs-tidy",
      addSpagoSources = true,
    },
  },
})
```

The language server operates on the extracted `.pue/` files that the Vite plugin generates. Diagnostics, completion, and hover work through this indirection.

## VSCode

### Syntax highlighting

The `editor/vscode/` directory contains a minimal extension for PureScript syntax highlighting in Vue SFCs.

To install locally:

1. Copy `editor/vscode/` to your `.vscode/extensions/pue-vscode/` directory
2. Ensure the [PureScript IDE](https://marketplace.visualstudio.com/items?itemName=nwolverson.ide-purescript) extension is installed (provides the `source.purescript` grammar)
3. Reload VSCode

The extension injects PureScript grammar into `<script lang="purs">` blocks within `.vue` files.

### How it works

The TextMate grammar injection (`pue-injection.json`) matches `<script>` tags with `lang="purs"` and applies `source.purescript` scoping to their contents. This requires the PureScript grammar to be available from another extension.

## Volar

For Vue language tools (Volar) integration, copy the config to your project root:

```bash
cp node_modules/pue/editor/volar.config.js ./volar.config.js
```

This registers pue as a Volar language plugin. The plugin currently provides basic support — PureScript blocks are treated as opaque to prevent false error reports from Volar's TypeScript analysis.
