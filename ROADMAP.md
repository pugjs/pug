# Roadmap

This document outlines what features can be expected to change before jade gets to 1.0.0 (i.e. stability).

## For discussion

 - Serialization of data-attributes, should it really do `JSON.stringify` (#1062 #1075)
 - How should the special cased `attributes` attribute work, can we do better (#664 #1000 #1152)
 - Consider defaults for debug mode (#1098)

## 0.36.0

 - Ability to specify per-filter options (#949)
 - Fix `element <space>.` (#1112 #1116)
 - Allow passing a `terse` option when rendering fragments (#1180)

## 1.0.0

 - Remove special casing of `script` and `style` (this has already been deprecated)
 - Remove automatic filtering of includes (to be replaced by an explicit "include + filter" syntax) (#888)
 - Add an inline tag syntax, something like `here is an inline #[a(href='/destination') link] within some text` (#936)
 - Stop parsing contents of comments and make unbuffered comments work anywhere (#931 #487 #1135 #1134 #1178)
 - Drop support for internet explorer 8 and older
 - Make compiling `client` templates a separate function

## Future

 - Child templates with contents should throw an error (#870)
 - Better errors for incorrectly named blocks in extending templates (#885)
 - Provide API for exposing dependency graph of jade files for dynamic recompilation (#957)
 - Error when the same block appears multiple times in a file (#1009)
 - Runtime filters so that interpolation is an option, this is up for debate (#1146)