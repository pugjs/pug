
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
  - combine dynamic and static tag classes
  - supports [Express JS](http://expressjs.com)
  - transparent iteration over objects, arrays, and even non-enumerables via `- each`
  - no tag prefix
  - filters
    - :sass must have [sass.js](http://github.com/visionmedia/sass.js) installed
    - :less must have [less.js](http://github.com/cloudhead/less.js) installed
    - :markdown must have [markdown-js](http://github.com/evilstreak/markdown-js) installed or [node-discount](http://github.com/visionmedia/node-discount)
    - :cdata
    - :javascript
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)

## Implementations

  - [php](http://github.com/everzet/jade.php)
  - [client-side js](http://github.com/miksago/jade)
  - [scala](http://scalate.fusesource.org/versions/snapshot/documentation/scaml-reference.html)

## Installation

via tarball or git:

    make install

via npm:

    npm install jade

## Public API

    var jade = require('jade');

    // Render a string
    jade.render('string of jade', { options: 'here' });

    // Render a file
    jade.renderFile('path/to/some.jade', { options: 'here' }, function(err, html){
	    // options are optional,
	    // the callback can be the second arg
    });

### Options

 - `scope`     Evaluation scope (`this`)
 - `locals`    Local variable object
 - `filename`  Used in exceptions, and required by `cache`
 - `cache`     Cache intermediate JavaScript in memory keyed by `filename`
 - `debug`     Outputs tokens and function body generated

## Syntax

### Line Endings

**CRLF** and **CR** are converted to **LF** before parsing.

### Indentation

Jade is indentation based, however currently only supports a _2 space_ indent.
We may implement tab support in the future, until then use spaces, so make sure soft
tabs are enabled in your editor.

### Tags

A tag is simply a leading word:

    html

for example is converted to `<html></html>`

tags can also have ids:

    div#container

which would render `<div id="container"></div>`

how about some classes?

    div.user-details

renders `<div class="user-details"></div>`

multiple classes? _and_ an id? sure:

    div#foo.bar.baz

renders `<div id="foo" class="bar baz"></div>`

div div div sure is annoying, how about:

    #foo
    .bar

which is syntactic sugar for what we have already been doing, and outputs:

    `<div id="foo"></div><div class="bar"></div>`

### Tag Text

Simply place some content after the tag:

    p wahoo!

renders `<p>wahoo!</p>`.

well cool, but how about large bodies of text:

    p
      | foo bar baz
      | rawr rawr
      | super cool
      | go jade go

renders `<p>foo bar baz rawr.....</p>`

interpolation? yup! both types of text can utilize interpolation,
if we passed `{ locals: { name: 'tj', email: 'tj@vision-media.ca' }}` to `render()`
we can do the following:

    #user #{name} &lt;#{email}&gt;

outputs `<div id="user">tj &lt;tj@vision-media.ca&gt;</div>`

Actually want `#{}` for some reason? escape it!

    p \#{something}

now we have `<p>#{something}</p>`

### Comments

Single line comments currently look the same as JavaScript comments,
aka "//" and must be placed on their own line:

    // just some paragraphs
    p foo
    p bar

would output

    <!-- just some paragraphs -->
    <p>foo</p>
    <p>bar</p>

### Nesting

    ul
      li one
      li two
      li three

Fucked up your whitespace? no worries, jade's error reporting should help you out.
Jade instruments the compiled JavaScript to provide meaningful context for runtime exceptions.

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

Boolean attributes are also supported:

    input(type="checkbox", checked)

Boolean attributes with code will only output the attribute when `true`:

	input(type="checkbox", checked: someValue)
    
Note: Leading / trailing whitespace is _ignore_ for attr pairs.

### Doctypes

To add a doctype simply use `!!!` followed by an optional value:

    !!!

Will output the _transitional_ doctype, however:

    !!! 5

Will output html 5's doctype. Below are the doctypes
defined by default, which can easily be extended:
    var doctypes = exports.doctypes = {
	    '5': '<!DOCTYPE html>',
	    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
	    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
	    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
	    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
	    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
	    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
	};

To alter the default simply change:

    jade.doctypes.default = 'whatever you want';

## Filters

Filters are prefixed with `:`, for example `:markdown` and
pass the following block of text to an arbitrary function for processing. View the _features_
at the top of this document for available filters.

    body
      :markdown
        | Woah! jade _and_ markdown, very **cool**
        | we can even link to [stuff](http://google.com)

Renders:

       <body><p>Woah! jade <em>and</em> markdown, very <strong>cool</strong> we can even link to <a href="http://google.com">stuff</a></p></body>

## Code

Jade currently supports three classifications of executable code. The first
is prefixed by `-`, and is not buffered:

    - var foo = 'bar';

This can be used for conditionals, or iteration:

    - for (var key in obj)
      p= obj[key]

Due to Jade's buffering techniques the following is valid as well:

    - if (foo)
      ul
        li yay
        li foo
        li worked
    - else
      p shit! didnt work

Hell, even verbose iteration:

    - if (items.length)
      ul
        - items.forEach(function(item){
	      li= item
	    - })

Anything you want!

Next up we have _escaped_ buffered code, which is used to
buffer a return value, which is prefixed by `=`:

    - var foo = 'bar'
    = foo
    h1= foo

Which outputs `bar<h1>bar<h1/>`. Code buffered by `=` is escaped 
by default for security, however to output unescaped return values
you may use `!=`:

    p!= aVarContainingMoreHTML

The on exception made in terms of allowing "vanilla" JavaScript, is
the `- each` token. This takes the form of:

    - each VAL[, KEY] in OBJ

An example iterating over an array:

    - var items = ["one", "two", "three"]
    - each item in items
      li= item

outputs:

    <li>one</li>
    <li>two</li>
    <li>three</li>

iterating an object's keys and values:

    - var obj = { foo: 'bar' }
    - each val, key in obj
      li #{key}: #{val}

would output `<li>foo: bar</li>`

Non-enumerables are simply passed as the **only** value:

    - each n in 15
      li= n

would simply output `<li>15</li>`

You can also nest these!

    - each user in users
      - each role in user.roles
        li= role

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

