
0.6.0 / 2010-12-19 
==================

  * Added unescaped interpolation variant `!{code}`. Closes #124
  * Changed; escape interpolated code by default `#{code}`

0.5.7 / 2010-12-08 
==================

  * Fixed; hyphen in get `tag()`

0.5.6 / 2010-11-24 
==================

  * Added `exports.compile(str, options)`
  * Renamed internal `_` to `__`, since `_()` is commonly used for translation

0.5.5 / 2010-10-30 
==================

  * Add _coffeescript_ filter [Michael Hampton]
  * Added link to _slim_; a ruby implementation
  * Fixed quoted attributes issue.

  * Fixed attribute issue with over greedy regexp.
    Previously "p(foo=(((('bar')))))= ((('baz')))"
    would __fail__ for example since the regexp
    would lookahead to far. Now we simply pair
    the delimiters.

0.5.4 / 2010-10-18 
==================

  * Adding newline when using tag code when preceding text
  * Assume newline in tag text when preceding text
  * Changed; retain leading text whitespace
  * Fixed code block support to prevent multiple buffer openings [Jake Luer]
  * Fixed nested filter support

0.5.3 / 2010-10-06 
==================

  * Fixed bug when tags with code also have a block [reported by chrisirhc]

0.5.2 / 2010-10-05 
==================

  * Added; Text introduces newlines to mimic the grammar.
    Whitespace handling is a little tricky with this sort of grammar.
    Jade will now mimic the written grammar, meaning that text blocks
    using the "|" margin character will introduce a literal newline,
    where as immediate tag text (ex "a(href='#') Link") will not.

    This may not be ideal, but it makes more sense than what Jade was     
    previously doing.

  * Added `Tag#text` to disambiguate between immediate / block text
  * Removed _pretty_ option (was kinda useless in the state it was in)
  * Reverted ignoring of newlines. Closes #92.
  * Fixed; `Parser#parse()` ignoring newlines

0.5.1 / 2010-10-04 
==================

  * Added many examples
  * Added; compiler api is now public
  * Added; filters can accept / manipulate the parse tree
  * Added filter attribute support. Closes #79
  * Added LL(*) capabilities
  * Performance; wrapping code blocks in {} instead of `(function(){}).call(this)`
  * Performance; Optimized attribute buffering
  * Fixed trailing newlines in blocks

0.5.0 / 2010-09-11 
==================

  * __Major__ refactor. Logic now separated into lexer/parser/compiler for future extensibility.
  * Added _pretty_ option
  * Added parse tree output for _debug_ option
  * Added new examples
  * Removed _context_ option, use _scope_

0.4.1 / 2010-09-09 
==================

  * Added support for arbitrary indentation for single-line comments. Closes #71
  * Only strip first space in text (ex '|  foo' will buffer ' foo')

0.4.0 / 2010-08-30 
==================

  * Added tab naive support (tabs are converted to a single indent, aka two spaces). Closes #24
  * Added unbuffered comment support. Closes #62
  * Added hyphen support for tag names, ex: "fb:foo-bar"
  * Fixed bug with single quotes in comments. Closes #61
  * Fixed comment whitespace issue, previously padding. Closes #55

0.3.0 / 2010-08-04
==================

  * Added single line comment support. Closes #25
  * Removed CDATA from _:javascript_ filter. Closes #47
  * Removed _sys_ local
  * Fixed code following tag

0.2.4 / 2010-08-02
==================

  * Added Buffer support to `render()`
  * Fixed filter text block exception reporting
  * Fixed tag exception reporting

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

