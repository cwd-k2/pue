; extends

; Inject PureScript syntax into <script lang="purs"> and <script setup lang="purs">
; Place this file at: ~/.config/nvim/after/queries/vue/injections.scm
; Requires tree-sitter-purescript parser to be installed.
((script_element
  (start_tag
    (attribute
      (attribute_name) @_attr
      (quoted_attribute_value
        (attribute_value) @_lang)))
  (raw_text) @injection.content)
  (#eq? @_attr "lang")
  (#eq? @_lang "purs")
  (#set! injection.language "purescript"))
