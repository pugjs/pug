
0.2.0 / 2010-07-08
==================

  * Added `- each` support for readable iteration
  * Added [markdown-js](http://github.com/evilstreak/markdown-js) support (no compilation required)
  * Removed node-discount support

0.1.0 / 2010-07-05
==================

  * Added `${}` support for interpolation. Closes #45
  * Added support for quoted attr keys: `label("for": 'something')` is allowed (_although not required_) [Guillermo]
  * Added `:less` filter [jakeluer]

0.0.2 / 2010-07-03
==================

  * Added `context` as synonym for `scope` option [Guillermo]
  * Fixed attr splitting: `div(style:"color: red")` is now allowed
  * Fixed issue with `(` and `)` within attrs: `a(class: (a ? 'a' : 'b'))` is now allowed
  * Fixed issue with leading / trailing spaces in attrs: `a( href="#" )` is now allowed [Guillermo]

