
# Jade - template engine

 Jade is a high performance template engine heavily influenced by [Haml](http://haml-lang.com)
 and implemented with JavaScript for [node](http://nodejs.org).

## Features

  - high performance parser
  - great readability
  - code is escaped by default for security
  - contextual error reporting at compile &amp; run time
  - executable for compiling jade templates via the command line
  - html 5 mode (using the _!!! 5_ doctype)
  - optional memory caching
  - no tag prefix
  - filters
    - :sass
    - :markdown
    - :cdata
    - :javascript

## Public API

    var jade = require('jade');

    // Render a string
    jade.render('string of jade', { options: 'here' });

    // Render a file
    jade.renderFile('path/to/some.jade', { options: 'here' }, function(err, html){
	    // options are optional,
	    // the callback can be the second arg
    });

## Syntax

### Line Endings

**CRLF** and **CR* are converted to **LF** before parsing.

### Indentation

Jade is indentation based, however currently only supports a _2 space_ indent.
We may implement tab support in the future, until then use spaces, so make sure soft
tabs are enabled in your editor.

### Nesting

    ul
      li one
      li two
      li three

Fucked up your whitespace? no worries, jade's error reporting should help you out:

    ul
        li one
      li two

    Error: /Users/tj/Projects/jade/examples/layout.jade:2
	    1. 'ul'
	    2. '    li one'

	Invalid indentation, got 2 expected 1.

Note: Trailing are generated on **EOS** if not present.

### Attributes

Jade currently supports '(' and ')' as attribute delimiters.

    a(href='/login', title='View login page') Login

Alternatively we may use the colon to separate pairs:

    a(href: '/login', title: 'View login page') Login

Note: Leading / trailing whitespace is _ignore_ for attr pairs.

## bin/jade

Output html to _stdout_:

    jade examples/*.jade --pipe

Generate _examples/*.html_:

    jade examples/*.jade

Pass options:

    jade examples/layout.jade --options '{ locals: { title: "foo" }}'

Usage info:

	Usage: jade [options] <path ...>

	Options:
	  -o, --options STR   JavaScript options object passed
	  -p, --pipe          Output to stdout instead of PATH.html
	  -h, --help          Output help information

