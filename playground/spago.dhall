{ name = "pue-playground"
, dependencies = [ "effect", "maybe", "prelude", "tuples" ]
, packages = ./packages.dhall
, sources = [ ".pue/**/*.purs", "../purescript/src/**/*.purs",  "src/**/*.purs", "test/**/*.purs" ]
}
