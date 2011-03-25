
# Jade - template engine

 Jade is a high performance template engine heavily influenced by [Haml](http://haml-lang.com)
 and implemented with JavaScript for [node](http://nodejs.org).

## Features

  - client-side support
  - great readability
  - flexible indentation
  - block-expansion
  - code is escaped by default for security
  - contextual error reporting at compile &amp; run time
  - executable for compiling jade templates via the command line
  - html 5 mode (using the _!!! 5_ doctype)
  - optional memory caching
  - combine dynamic and static tag classes
  - parse tree manipulation via _filters_
  - supports [Express JS](http://expressjs.com) out of the box
  - transparent iteration over objects, arrays, and even non-enumerables via `- each`
  - block comments
  - no tag prefix
  - AST filters
  - filters
    - :sass must have [sass.js](http://github.com/visionmedia/sass.js) installed
    - :less must have [less.js](http://github.com/cloudhead/less.js) installed
    - :markdown must have [markdown-js](http://github.com/evilstreak/markdown-js) installed or [node-discount](http://github.com/visionmedia/node-discount)
    - :cdata
    - :coffeescript must have [coffee-script](http://jashkenas.github.com/coffee-script/) installed
  - [Vim Syntax](https://github.com/digitaltoad/vim-jade)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [Screencasts](http://tjholowaychuk.com/post/1004255394/jade-screencast-template-engine-for-nodejs)

## Implementations

  - [php](http://github.com/everzet/jade.php)
  - [scala](http://scalate.fusesource.org/versions/snapshot/documentation/scaml-reference.html)
  - [ruby](http://github.com/stonean/slim)

## Installation

via npm:

    npm install jade

## Browser Support

 To compile jade to a single file compatible for client-side use simply execute:
 
    $ make jade.js

 Alternatively, if uglifyjs is installed via npm (`npm install uglify-js`) you may execute the following which will create both files.
 
    $ make jade.min.js

## Public API

    var jade = require('jade');

    // Render a string
    jade.render('string of jade', { options: 'here' });

    // Render a file
    jade.renderFile('path/to/some.jade', { options: 'here' }, function(err, html){
	    // options are optional,
	    // the callback can be the second arg
    });

    // Compile a function
    var fn = jade.compile('string of jade', options);
    fn.call(scope, locals);

### Options

 - `scope`     Evaluation scope (`this`)
 - `locals`    Local variable object
 - `filename`  Used in exceptions, and required by `cache`
 - `cache`     Cache intermediate JavaScript in memory keyed by `filename`
 - `debug`     Outputs tokens and function body generated
 - `compiler`  Compiler to replace jade's default

## Syntax

### Line Endings

**CRLF** and **CR** are converted to **LF** before parsing.

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

We can also utilize the unescaped variant `!{html}`, so the following
will result in a literal script tag:

    - var html = "<script></script>"
    | !{html}

Nested tags that also contain text can optionally use a text block:

    label
      | Username:
      input(name='user[name]')

or immediate tag text:

    label Username:
      input(name='user[name]')

Tags that accept _only_ text such as `script`, `style`, and `textarea` do not
need the leading `|` character, for example:

      html
        head
          title Example
          script
            if (foo) {
              bar();
            } else {
              baz();
            }

Once again as an alternative, we may use a leading '.' to indicate a text block, for example:

      p.
        foo asdf
        asdf
         asdfasdfaf
         asdf
        asd.

outputs:

        <p>foo asdf
        asdf
          asdfasdfaf
          asdf
        asd
        .
        </p>

This however differs from a leading '.' followed by a space, which although is ignored by the Jade parser, tells Jade that this period is a literal:

    p .
    
outputs:

    <p>.</p>

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

Jade also supports unbuffered comments, by simply adding a hyphen:

    //- will not output within markup
    p foo
    p bar

outputting

    <p>foo</p>
    <p>bar</p>

### Block Comments

 A block comment is the `/` character followed by a block.

      body
        /
          #content
            h1 Example

outputting

    <body>
      <!--
      <div id="content">
        <h1>Example</h1>
      </div>
      -->
    </body>

Jade supports conditional-comments as well, for example:

    body
      /if IE
        a(href='http://www.mozilla.com/en-US/firefox/') Get Firefox

outputs:

    <body>
      <!--[if IE]>
        <a href="http://www.mozilla.com/en-US/firefox/">Get Firefox</a>
      <![endif]-->
    </body>


### Nesting

 Jade supports nesting to define the tags in a natural way:

    ul
      li.first
        a(href='#') foo
      li
        a(href='#') bar
      li.last
        a(href='#') baz

### Block Expansion

 Block expansion allows you to create terse single-line nested tags,
 the following example is equivalent to the nesting example above.

      ul
        li.first: a(href='#') foo
        li: a(href='#') bar
        li.last: a(href='#') baz


### Attributes

Jade currently supports '(' and ')' as attribute delimiters.

    a(href='/login', title='View login page') Login

Alternatively we may use the colon to separate pairs:

    a(href: '/login', title: 'View login page') Login

Boolean attributes are also supported:

    input(type="checkbox", checked)

Boolean attributes with code will only output the attribute when `true`:

	input(type="checkbox", checked: someValue)
    
Multiple lines work too:

    input(type='checkbox',
      name='agreement',
      checked)

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
        Woah! jade _and_ markdown, very **cool**
        we can even link to [stuff](http://google.com)

Renders:

       <body><p>Woah! jade <em>and</em> markdown, very <strong>cool</strong> we can even link to <a href="http://google.com">stuff</a></p></body>

Filters may also manipulate the parse tree. For example perhaps I want to
bake conditionals right into jade, we could do so with a filter named _conditionals_. Typically filters work on text blocks, however by passing a regular block our filter can do anything it wants with the tags nested within it.

    body
      conditionals:
        if role == 'admin'
          p You are amazing
        else
          p Not so amazing

Not that we no longer prefix with "-" for these code blocks. Examples of 
how to manipulate the parse tree can be found at _./examples/conditionals.js_ and _./examples/model.js_, basically we subclass and re-implement visitor methods as needed. There are several interesting use-cases for this functionality above what was shown above such as transparently aggregating / compressing assets to reduce the number of HTTP requests, transparent record error reporting, and more.

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
      p oh no! didnt work

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

You can also nest these!

    - each user in users
      - each role in user.roles
        li= role

When a property is undefined, Jade will output an empty string. For example:

    textarea= user.signature

when undefined would normally output "undefined" in your html, however recent
versions of Jade will simply render:

    <textarea></textarea>

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

## License 

(The MIT License)

Copyright (c) 2009-2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
