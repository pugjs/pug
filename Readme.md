# Jade - template engine

 Jade is a high performance template engine heavily influenced by [Haml](http://haml-lang.com)
 and implemented with JavaScript for [node](http://nodejs.org).

## Features

  - client-side support
  - great readability
  - flexible indentation
  - block-expansion
  - mixins
  - static includes
  - attribute interpolation
  - code is escaped by default for security
  - contextual error reporting at compile &amp; run time
  - executable for compiling jade templates via the command line
  - html 5 mode (using the _!!! 5_ doctype)
  - optional memory caching
  - combine dynamic and static tag classes
  - parse tree manipulation via _filters_
  - template inheritance
  - supports [Express JS](http://expressjs.com) out of the box
  - transparent iteration over objects, arrays, and even non-enumerables via `each`
  - block comments
  - no tag prefix
  - AST filters
  - filters
    - :stylus must have [stylus](http://github.com/LearnBoost/stylus) installed
    - :sass must have [sass.js](http://github.com/visionmedia/sass.js) installed
    - :less must have [less.js](http://github.com/cloudhead/less.js) installed
    - :markdown must have [markdown-js](http://github.com/evilstreak/markdown-js) installed or [node-discount](http://github.com/visionmedia/node-discount)
    - :cdata
    - :coffeescript must have [coffee-script](http://jashkenas.github.com/coffee-script/) installed
  - [Vim Syntax](https://github.com/digitaltoad/vim-jade)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [Screencasts](http://tjholowaychuk.com/post/1004255394/jade-screencast-template-engine-for-nodejs)
  - [html2jade](https://github.com/donpark/html2jade) converter

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

 Alternatively, if uglifyjs is installed via npm (`npm install uglify-js`) you may execute the following which will create both files. However each release builds these for you.
 
    $ make jade.min.js

  By default Jade instruments templates with line number statements such as `__.lineno = 3` for debugging purposes. When used in a browser it's useful to minimize this boiler plate, you can do so by passing the option `{ compileDebug: false }`. The following template
  
    p Hello #{name}

 Can then be as small as the following generated function:

```js
function anonymous(locals, attrs, escape, rethrow) {
  var buf = [];
  with (locals || {}) {
    var interp;
    buf.push('\n<p>Hello ' + escape((interp = name) == null ? '' : interp) + '\n</p>');
  }
  return buf.join("");
}
```

  Through the use of Jade's `./runtime.js` you may utilize these pre-compiled templates on the client-side _without_ Jade itself, all you need is the associated utility functions (in runtime.js), which are then available as `jade.attrs`, `jade.escape` etc. To enable this you should pass `{ client: true }` to `jade.compile()` to tell Jade to reference the helper functions
  via `jade.attrs`, `jade.escape` etc.

```js
function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
    var interp;
    buf.push('\n<p>Hello ' + escape((interp = name) == null ? '' : interp) + '\n</p>');
  }
  return buf.join("");
}
```

## Public API

```javascript
    var jade = require('jade');

    // Compile a function
    var fn = jade.compile('string of jade', options);
    fn(locals);
```

### Options

 - `self`      Use a `self` namespace to hold the locals. _false by default_
 - `locals`    Local variable object
 - `filename`  Used in exceptions, and required when using includes
 - `debug`     Outputs tokens and function body generated
 - `compiler`  Compiler to replace jade's default
 - `compileDebug`  When `false` no debug instrumentation is compiled

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
if we passed `{ name: 'tj', email: 'tj@vision-media.ca' }` to the compiled function we can do the following:

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

Tags that accept _only_ text such as `script` and `style` do not
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

Once again as an alternative, we may use a trailing '.' to indicate a text block, for example:

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

This however differs from a trailing '.' followed by a space, which although is ignored by the Jade parser, tells Jade that this period is a literal:

    p .
    
outputs:

    <p>.</p>


It should be noted that text blocks should be doubled escaped.  For example if you desire the following output.

    </p>foo\bar</p>

use:

    p.
      foo\\bar

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

 A block comment is legal as well:

      body
        //
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

    head
      //if lt IE 8
        script(src='/ie-sucks.js')

outputs:

    <body>
      <!--[if lt IE 8]>
        <script src="/ie-sucks.js"></script>
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

When a value is `undefined` or `null` the attribute is _not_ added,
so this is fine, it will not compile 'something="null"'.

    div(something=null)

Boolean attributes are also supported:

    input(type="checkbox", checked)

Boolean attributes with code will only output the attribute when `true`:

    input(type="checkbox", checked=someValue)
    
Multiple lines work too:

    input(type='checkbox',
      name='agreement',
      checked)

Multiple lines without the comma work fine:

    input(type='checkbox'
      name='agreement'
      checked)

Funky whitespace? fine:


    input(
      type='checkbox'
      name='agreement'
      checked)

Colons work:

    rss(xmlns:atom="atom")

Suppose we have the `user` local `{ id: 12, name: 'tobi' }`
and we wish to create an anchor tag with `href` pointing to "/user/12"
we could use regular javascript concatenation:

    a(href='/user/' + user.id)= user.name

or we could use jade's interpolation, which I added because everyone
using Ruby or CoffeeScript seems to think this is legal js..:

   a(href='/user/#{user.id}')= user.name

The `class` attribute is special-cased when an array is given,
allowing you to pass an array such as `bodyClasses = ['user', 'authenticated']` directly:

    body(class=bodyClasses)

### HTML

 Inline html is fine, we can use the pipe syntax to 
 write arbitrary text, in this case some html:

```
html
  body
    | <h1>Title</h1>
    | <p>foo bar baz</p>
```

 Or we can use the trailing `.` to indicate to Jade that we
 only want text in this block, allowing us to omit the pipes:

```
html
  body.
    <h1>Title</h1>
    <p>foo bar baz</p>
```

 Both of these examples yield the same result:

```
<html><body><h1>Title</h1>
<p>foo bar baz</p>
</body></html>
```

 The same rule applies for anywhere you can have text
 in jade, raw html is fine:

```
html
  body
    h1 User <em>#{name}</em>
```

### Doctypes

To add a doctype simply use `!!!`, or `doctype` followed by an optional value:

    !!!

Will output the _transitional_ doctype, however:

    !!! 5

or

    !!! html

or

    doctype html

doctypes are case-insensitive, so the following are equivalent:

    doctype Basic
    doctype basic

it's also possible to simply pass a doctype literal:

    doctype html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN

yielding:

    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN>

Will output the _html 5_ doctype. Below are the doctypes
defined by default, which can easily be extended:

```javascript
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
```

To alter the default simply change:

```javascript
    jade.doctypes.default = 'whatever you want';
```

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

Which outputs `bar<h1>bar</h1>`. Code buffered by `=` is escaped 
by default for security, however to output unescaped return values
you may use `!=`:

    p!= aVarContainingMoreHTML

 Jade also has designer-friendly variants, making the literal JavaScript
 more expressive and declarative. For example the following assignments
 are equivalent, and the expression is still regular javascript:
 
     - var foo = 'foo ' + 'bar'
     foo = 'foo ' + 'bar'

  Likewise Jade has first-class `if`, `else if`, `else`, `until`, `while`, `unless` among others, however you must remember that the expressions are still regular javascript:

     if foo == 'bar'
       ul
         li yay
         li foo
         li worked
     else
       p oh no! didnt work  

## Iteration

 Along with vanilla JavaScript Jade also supports a subset of
 constructs that allow you to create more designer-friendly templates,
 one of these constructs is `each`, taking the form:

    each VAL[, KEY] in OBJ

An example iterating over an array:

    - var items = ["one", "two", "three"]
    each item in items
      li= item

outputs:

    <li>one</li>
    <li>two</li>
    <li>three</li>

iterating an array with index:

    items = ["one", "two", "three"]
    each item, i in items
      li #{item}: #{i}

outputs:

    <li>one: 0</li>
    <li>two: 1</li>
    <li>three: 2</li>

iterating an object's keys and values:

    obj = { foo: 'bar' }
    each val, key in obj
      li #{key}: #{val}

would output `<li>foo: bar</li>`

Internally Jade converts these statements to regular
JavaScript loops such as `users.forEach(function(user){`,
so lexical scope and nesting applies as it would with regular
JavaScript:

    each user in users
      each role in user.roles
        li= role

 You may also use `for` if you prefer:
 
    for user in users
      for role in user.roles
        li= role

## Conditionals

 Jade conditionals are equivalent to those using the code (`-`) prefix,
 however allow you to ditch parenthesis to become more designer friendly,
 however keep in mind the expression given is _regular_ JavaScript:

    for user in users
      if user.role == 'admin'
        p #{user.name} is an admin
      else
        p= user.name

 is equivalent to the following using vanilla JavaScript literals:

     for user in users
       - if (user.role == 'admin')
         p #{user.name} is an admin
       - else
         p= user.name

  Jade also provides have `unless` which is equivalent to `if (!(expr))`:

     for user in users
       unless user.isAnonymous
         p
           | Click to view
           a(href='/users/' + user.id)= user.name 

## Template inheritance

  Jade supports template inheritance via the `block` and `extends` keywords. A block is simply a "block" of Jade that may be replaced within a child template, this process is recursive.
  
  Jade blocks can provide default content if desired, however optional as shown below by `block scripts`, `block content`, and `block foot`.

```
html
  head
    h1 My Site - #{title}
    block scripts
      script(src='/jquery.js')
  body
    block content
    block foot
      #footer
        p some footer content
```

  Now to extend the layout, simply create a new file and use the `extends` directive as shown below, giving the path (with or without the .jade extension). You may now define one or more blocks that will override the parent block content, note that here the `foot` block is _not_ redefined and will output "some footer content".

```
extends extend-layout

block scripts
  script(src='/jquery.js')
  script(src='/pets.js')

block content
  h1= title
  each pet in pets
    include pet
```

  It's also possible to override a block to provide additional blocks, as shown in the following example where `content` now exposes a `sidebar` and `primary` block for overriding, or the child template could override `content` all together.

```
extends regular-layout

block content
  .sidebar
    block sidebar
      p nothing
  .primary
    block primary
      p nothing
```

## Includes

 Includes allow you to statically include chunks of Jade,
 or other content like css, or html which lives in separate files. The classical example is including a header and footer. Suppose we have the following directory structure:

     ./layout.jade
     ./includes/
       ./head.jade
       ./tail.jade

and the following _layout.jade_:

      html
        include includes/head  
        body
          h1 My Site
          p Welcome to my super amazing site.
          include includes/foot

both includes _includes/head_ and _includes/foot_ are
read relative to the `filename` option given to _layout.jade_,
which should be an absolute path to this file, however Express does this for you. Include then parses these files, and injects the AST produced to render what you would expect:

```html
<html>
  <head>
    <title>My Site</title>
    <script src="/javascripts/jquery.js">
    </script><script src="/javascripts/app.js"></script>
  </head>
  <body>
    <h1>My Site</h1>
    <p>Welcome to my super lame site.</p>
    <div id="footer">
      <p>Copyright>(c) foobar</p>
    </div>
  </body>
</html>
```

 As mentioned `include` can be used to include other content
 such as html or css. By providing an extension Jade will not
 assume that the file is Jade source and will include it as
 a literal:

```
html
  body
    include content.html
```

  Include directives may also accept a block, in which case the
  the given block will be appended to the _last_ block defined
  in the file. For example if `head.jade` contains:

```
head
  script(src='/jquery.js')
```

 We may append values by providing a block to `include head`
 as shown below, adding the two scripts.

```
html
  include head
    script(src='/foo.js')
    script(src='/bar.js')
  body
    h1 test
```


## Mixins

 Mixins are converted to regular JavaScript functions in
 the compiled template that Jade constructs. Mixins may
 take arguments, though not required:

      mixin list
        ul
          li foo
          li bar
          li baz

  Utilizing a mixin without args looks similar, just without a block:
  
      h2 Groceries
      mixin list

  Mixins may take one or more arguments as well, the arguments
  are regular javascripts expressions, so for example the following:

      mixin pets(pets)
        ul.pets
          - each pet in pets
            li= pet

      mixin profile(user)
        .user
          h2= user.name
          mixin pets(user.pets)

   Would yield something similar to the following html:

```html
<div class="user">
  <h2>tj</h2>
  <ul class="pets">
    <li>tobi</li>
    <li>loki</li>
    <li>jane</li>
    <li>manny</li>
  </ul>
</div>
```

## Generated Output

 Suppose we have the following Jade:

```
- var title = 'yay'
h1.title #{title}
p Just an example
```

 When the `compileDebug` option is not explicitly `false`, Jade
 will compile the function instrumented with `__.lineno = n;`, which
 in the event of an exception is passed to `rethrow()` which constructs
 a useful message relative to the initial Jade input.

```js
function anonymous(locals) {
  var __ = { lineno: 1, input: "- var title = 'yay'\nh1.title #{title}\np Just an example", filename: "testing/test.js" };
  var rethrow = jade.rethrow;
  try {
    var attrs = jade.attrs, escape = jade.escape;
    var buf = [];
    with (locals || {}) {
      var interp;
      __.lineno = 1;
       var title = 'yay'
      __.lineno = 2;
      buf.push('<h1');
      buf.push(attrs({ "class": ('title') }));
      buf.push('>');
      buf.push('' + escape((interp = title) == null ? '' : interp) + '');
      buf.push('</h1>');
      __.lineno = 3;
      buf.push('<p>');
      buf.push('Just an example');
      buf.push('</p>');
    }
    return buf.join("");
  } catch (err) {
    rethrow(err, __.input, __.filename, __.lineno);
  }
}
```

When the `compileDebug` option _is_ explicitly `false`, this instrumentation
is stripped, which is very helpful for light-weight client-side templates. Combining Jade's options with the `./runtime.js` file in this repo allows you
to toString() compiled templates and avoid running the entire Jade library on
the client, increasing performance, and decreasing the amount of JavaScript
required.

```js
function anonymous(locals) {
  var attrs = jade.attrs, escape = jade.escape;
  var buf = [];
  with (locals || {}) {
    var interp;
    var title = 'yay'
    buf.push('<h1');
    buf.push(attrs({ "class": ('title') }));
    buf.push('>');
    buf.push('' + escape((interp = title) == null ? '' : interp) + '');
    buf.push('</h1>');
    buf.push('<p>');
    buf.push('Just an example');
    buf.push('</p>');
  }
  return buf.join("");
}
```

## Example Makefile

  Below is an example Makefile used to compile _pages/*.jade_
  into _pages/*.html_ files by simply executing `make`.
 
```make
JADE = $(shell find pages/*.jade)
HTML = $(JADE:.jade=.html)

all: $(HTML)
	
%.html: %.jade
	jade < $< --path $< > $@

clean:
	rm -f $(HTML)

.PHONY: clean
```

this can be combined with the `watch(1)` command to produce
a watcher-like behaviour:

     $ watch make

## jade(1)

```

Usage: jade [options] [dir|file ...]

Options:

  -h, --help         output usage information
  -v, --version      output the version number
  -o, --obj <str>    javascript options object
  -O, --out <dir>    output the compiled html to <dir>
  -p, --path <path>  filename used to resolve includes over stdio

Examples:

  # translate jade the templates dir
  $ jade templates

  # create {foo,bar}.html
  $ jade {foo,bar}.jade

  # jade over stdio
  $ jade < my.jade > my.html

  # jade over stdio specifying filename to resolve include directives
  $ jade < my.jade -p my.jade > my.html

  # jade over stdio
  $ echo "h1 Jade!" | jade

  # foo, bar dirs rendering to /tmp
  $ jade foo bar --out /tmp 

```

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
