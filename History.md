
0.2.3 / 2010-07-27
==================

  * Fixed newlines before block
  * Fixed; tag text allowing arbitrary trailing whitespace

0.2.2 / 2010-07-16
==================

  * Added support for `jade.renderFile()` to utilize primed cache
  * Added link to [textmate bundle](http://github.com/miksago/jade-tmbundle)
  * Fixed filter issue with single quotes
  * Fixed hyphenated attr bug
  * Fixed interpolation single quotes. Closes #28
  * Fixed issue with comma in attrs

0.2.1 / 2010-07-09
==================

  * Added support for node-discount and markdown-js
    depending on which is available.

  * Added support for tags to have blocks _and_ text.
    this kinda fucks with arbitrary whitespace unfortunately,
    but also fixes trailing spaces after tags _with_ blocks.

  * Caching generated functions. Closes #46

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

