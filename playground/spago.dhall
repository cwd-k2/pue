{ name = "pue-playground"
, dependencies = [ "effect", "prelude" ]
, packages = ./packages.dhall
, sources = [ ".pue/**/*.purs", "../purescript/src/**/*.purs",  "src/**/*.purs", "test/**/*.purs" ]
}
