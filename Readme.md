
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

