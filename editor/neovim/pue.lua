-- Neovim configuration for pue (PureScript in Vue SFCs)
-- Add to your init.lua or a plugin config file.

local M = {}

--- Install tree-sitter-purescript if using nvim-treesitter
--- :TSInstall purescript
--- Then copy queries/vue/injections.scm to:
---   ~/.config/nvim/after/queries/vue/injections.scm

--- Configure purescript-language-server for .pue/ extracted files.
--- This enables LSP features (completion, diagnostics, hover) on the
--- extracted PureScript source that the Vite plugin generates.
function M.setup()
  local lspconfig_ok, lspconfig = pcall(require, "lspconfig")
  if not lspconfig_ok then return end

  lspconfig.purescriptls.setup({
    cmd = { "purescript-language-server", "--stdio" },
    filetypes = { "purescript" },
    root_dir = lspconfig.util.root_pattern("spago.dhall", "spago.yaml", "bower.json"),
    settings = {
      purescript = {
        formatter = "purs-tidy",
        addSpagoSources = true,
      },
    },
  })

  -- Auto-format .purs files on save
  vim.api.nvim_create_autocmd("BufWritePre", {
    pattern = "*.purs",
    callback = function()
      vim.lsp.buf.format({ async = false })
    end,
  })
end

return M
