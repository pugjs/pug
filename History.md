
0.0.2 / 2010-07-03
==================

  * Added `context` as synonym for `scope` option [Guillermo]
  * Fixed attr splitting: `div(style:"color: red")` is now allowed
  * Fixed issue with `(` and `)` within attrs: `a(class: (a ? 'a' : 'b'))` is now allowed
  * Fixed issue with leading / trailing spaces in attrs: `a( href="#" )` is now allowed [Guillermo]

