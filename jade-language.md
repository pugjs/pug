
<a name="a6"/>
## Syntax

<a name="a6-2"/>
### Tags

A tag is simply a leading word:

```jade
html
```

for example is converted to `<html></html>`

tags can also have ids:

```jade
div#container
```

which would render `<div id="container"></div>`

how about some classes?

```jade
div.user-details
```

renders `<div class="user-details"></div>`

multiple classes? _and_ an id? sure:

```jade
div#foo.bar.baz
```

renders `<div id="foo" class="bar baz"></div>`

div div div sure is annoying, how about:

```jade
#foo
.bar
```

which is syntactic sugar for what we have already been doing, and outputs:

```html
<div id="foo"></div><div class="bar"></div>
```

<a name="a6-3"/>
### Tag Text

Simply place some content after the tag:

```jade
p wahoo!
```

renders `<p>wahoo!</p>`.

well cool, but how about large bodies of text:

```jade
p
  | foo bar baz
  | rawr rawr
  | super cool
  | go jade go
```

renders `<p>foo bar baz rawr.....</p>`

interpolation? yup! both types of text can utilize interpolation,
if we passed `{ name: 'tj', email: 'tj@vision-media.ca' }` to the compiled function we can do the following:

```jade
#user #{name} &lt;#{email}&gt;
```

outputs `<div id="user">tj &lt;tj@vision-media.ca&gt;</div>`

Actually want `#{}` for some reason? escape it!

```jade
p \#{something}
```

now we have `<p>#{something}</p>`

We can also utilize the unescaped variant `!{html}`, so the following
will result in a literal script tag:

```jade
- var html = "<script></script>"
| !{html}
```

Nested tags that also contain text can optionally use a text block:

```jade
label
  | Username:
  input(name='user[name]')
```

or immediate tag text:

```jade
label Username:
  input(name='user[name]')
```

As an alternative, we may use a trailing `.` to indicate a text block, for example:

```jade
p.
  foo asdf
  asdf
   asdfasdfaf
   asdf
  asd.
```

outputs:

```html
<p>foo asdf
asdf
  asdfasdfaf
  asdf
asd.
</p>
```

This however differs from a trailing `.` followed by a space, which although is ignored by the Jade parser, tells Jade that this period is a literal:

```jade
p .
```

outputs:

```html
<p>.</p>
```

It should be noted that text blocks should be doubled escaped.  For example if you desire the following output.

```html
<p>foo\bar</p>
```

use:

```jade
p.
  foo\\bar
```

<a name="a6-4"/>
### Comments

Single line comments currently look the same as JavaScript comments,
aka `//` and must be placed on their own line:

```jade
// just some paragraphs
p foo
p bar
```

would output

```html
<!-- just some paragraphs -->
<p>foo</p>
<p>bar</p>
```

Jade also supports unbuffered comments, by simply adding a hyphen:

```jade
//- will not output within markup
p foo
p bar
```

outputting

```html
<p>foo</p>
<p>bar</p>
```

<a name="a6-5"/>
### Block Comments

 A block comment is legal as well:

```jade
body
  //
    #content
      h1 Example
```

outputting

```html
<body>
  <!--
  <div id="content">
    <h1>Example</h1>
  </div>
  -->
</body>
```

Jade supports conditional-comments as well, for example:

```jade
head
  //if lt IE 8
    script(src='/ie-sucks.js')
```

outputs:

```html
<head>
  <!--[if lt IE 8]>
  <script src="/ie-sucks.js"></script>
  <![endif]-->
</head>
```

<a name="a6-6"/>
### Nesting

 Jade supports nesting to define the tags in a natural way:

```jade
ul
  li.first
    a(href='#') foo
  li
    a(href='#') bar
  li.last
    a(href='#') baz
```

<a name="a6-7"/>
### Block Expansion

 Block expansion allows you to create terse single-line nested tags,
 the following example is equivalent to the nesting example above.

```jade
ul
  li.first: a(href='#') foo
  li: a(href='#') bar
  li.last: a(href='#') baz
```

<a name="a6-8"/>
### Case

 The case statement takes the following form:

```jade
html
  body
    friends = 10
    case friends
      when 0
        p you have no friends
      when 1
        p you have a friend
      default
        p you have #{friends} friends
```

 Block expansion may also be used:

```jade
friends = 5

html
  body
    case friends
      when 0: p you have no friends
      when 1: p you have a friend
      default: p you have #{friends} friends
```

<a name="a6-9"/>
### Attributes

Jade currently supports `(` and `)` as attribute delimiters.

```jade
a(href='/login', title='View login page') Login
```

When a value is `undefined` or `null` the attribute is _not_ added,
so this is fine, it will not compile `something="null"`.

```jade
div(something=null)
```

Boolean attributes are also supported:

```jade
input(type="checkbox", checked)
```

Boolean attributes with code will only output the attribute when `true`:

```jade
input(type="checkbox", checked=someValue)
```

Multiple lines work too:

```jade
input(type='checkbox',
  name='agreement',
  checked)
```

Multiple lines without the comma work fine:

```jade
input(type='checkbox'
  name='agreement'
  checked)
```

Funky whitespace? fine:

```jade
input(
  type='checkbox'
  name='agreement'
  checked)
```

Colons work:

```jade
rss(xmlns:atom="atom")
```

Suppose we have the `user` local `{ id: 12, name: 'tobi' }`
and we wish to create an anchor tag with `href` pointing to "/user/12"
we could use regular javascript concatenation:

```jade
a(href='/user/' + user.id)= user.name
```

or we could use jade's interpolation, which I added because everyone
using Ruby or CoffeeScript seems to think this is legal js..:

```jade
a(href='/user/#{user.id}')= user.name
```

The `class` attribute is special-cased when an array is given,
allowing you to pass an array such as `bodyClasses = ['user', 'authenticated']` directly:

```jade
body(class=bodyClasses)
```

<a name="a6-10"/>
### HTML

 Inline html is fine, we can use the pipe syntax to
 write arbitrary text, in this case some html:

```jade
html
  body
    | <h1>Title</h1>
    | <p>foo bar baz</p>
```

 Or we can use the trailing `.` to indicate to Jade that we
 only want text in this block, allowing us to omit the pipes:

```jade
html
  body.
    <h1>Title</h1>
    <p>foo bar baz</p>
```

 Both of these examples yield the same result:

```html
<html><body><h1>Title</h1>
<p>foo bar baz</p>
</body></html>
```

 The same rule applies for anywhere you can have text
 in jade, raw html is fine:

```jade
html
  body
    h1 User <em>#{name}</em>
```

<a name="a6-11"/>
### Doctypes

To add a doctype simply use `!!!`, or `doctype` followed by an optional value:

```jade
!!!
```

or

```jade
doctype
```

Will output the _html 5_  doctype, however:

```jade
!!! transitional
```

Will output the _transitional_ doctype.

Doctypes are case-insensitive, so the following are equivalent:

```jade
doctype Basic
doctype basic
```

it's also possible to simply pass a doctype literal:

```jade
doctype html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
```

yielding:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN">
```

Below are the doctypes defined by default, which can easily be extended:

```js
var doctypes = exports.doctypes = {
  '5': '<!DOCTYPE html>',
  'default': '<!DOCTYPE html>',
  'xml': '<?xml version="1.0" encoding="utf-8" ?>',
  'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
};
```

To alter the default simply change:

```js
jade.doctypes.default = 'whatever you want';
```

<a name="a7"/>
## Filters

Filters are prefixed with `:`, for example `:markdown` and
pass the following block of text to an arbitrary function for processing. View the _features_
at the top of this document for available filters.

```jade
body
  :markdown
    Woah! jade _and_ markdown, very **cool**
    we can even link to [stuff](http://google.com)
```

Renders:

```html
<body><p>Woah! jade <em>and</em> markdown, very <strong>cool</strong> we can even link to <a href="http://google.com">stuff</a></p></body>
```

<a name="a8"/>
## Code

Jade currently supports three classifications of executable code. The first
is prefixed by `-`, and is not buffered:

```jade
- var foo = 'bar';
```

This can be used for conditionals, or iteration:

```jade
- for (var key in obj)
  p= obj[key]
```

Due to Jade's buffering techniques the following is valid as well:

```jade
- if (foo)
  ul
    li yay
    li foo
    li worked
- else
  p oh no! didnt work
```

Hell, even verbose iteration:

```jade
- if (items.length)
  ul
    - items.forEach(function(item){
      li= item
    - })
```

Anything you want!

Next up we have _escaped_ buffered code, which is used to
buffer a return value, which is prefixed by `=`:

```jade
- var foo = 'bar'
= foo
h1= foo
```

Which outputs `bar<h1>bar</h1>`. Code buffered by `=` is escaped
by default for security, however to output unescaped return values
you may use `!=`:

```jade
p!= aVarContainingMoreHTML
```

 Jade also has designer-friendly variants, making the literal JavaScript
 more expressive and declarative. For example the following assignments
 are equivalent, and the expression is still regular javascript:

```jade
- var foo = 'foo ' + 'bar'
foo = 'foo ' + 'bar'
```

  Likewise Jade has first-class `if`, `else if`, `else`, `until`, `while`, `unless` among others, however you must remember that the expressions are still regular javascript:

```jade
if foo == 'bar'
  ul
    li yay
    li foo
    li worked
else
  p oh no! didnt work
```

<a name="a9"/>
## Iteration

 Along with vanilla JavaScript Jade also supports a subset of
 constructs that allow you to create more designer-friendly templates,
 one of these constructs is `each`, taking the form:

```jade
each VAL[, KEY] in OBJ
```

An example iterating over an array:

```jade
- var items = ["one", "two", "three"]
each item in items
  li= item
```

outputs:

```html
<li>one</li>
<li>two</li>
<li>three</li>
```

iterating an array with index:

```jade
items = ["one", "two", "three"]
each item, i in items
  li #{item}: #{i}
```

outputs:

```html
<li>one: 0</li>
<li>two: 1</li>
<li>three: 2</li>
```

iterating an object's keys and values:

```jade
obj = { foo: 'bar' }
each val, key in obj
  li #{key}: #{val}
```

would output `<li>foo: bar</li>`

Internally Jade converts these statements to regular
JavaScript loops such as `users.forEach(function(user){`,
so lexical scope and nesting applies as it would with regular
JavaScript:

```jade
each user in users
  each role in user.roles
    li= role
```

 You may also use `for` if you prefer:

```jade
for user in users
  for role in user.roles
    li= role
```

<a name="a10"/>
## Conditionals

 Jade conditionals are equivalent to those using the code (`-`) prefix,
 however allow you to ditch parenthesis to become more designer friendly,
 however keep in mind the expression given is _regular_ JavaScript:

```jade
for user in users
  if user.role == 'admin'
    p #{user.name} is an admin
  else
    p= user.name
```

 is equivalent to the following using vanilla JavaScript literals:

```jade
for user in users
  - if (user.role == 'admin')
    p #{user.name} is an admin
  - else
    p= user.name
```

  Jade also provides `unless` which is equivalent to `if (!(expr))`:

```jade
for user in users
  unless user.isAnonymous
    p
      | Click to view
      a(href='/users/' + user.id)= user.name
```

<a name="a11"/>
## Template inheritance

  Jade supports template inheritance via the `block` and `extends` keywords. A block is simply a "block" of Jade that may be replaced within a child template, this process is recursive. To activate template inheritance in Express 2.x you must add: `app.set('view options', { layout: false });`.

  Jade blocks can provide default content if desired, however optional as shown below by `block scripts`, `block content`, and `block foot`.

```jade
html
  head
    title My Site - #{title}
    block scripts
      script(src='/jquery.js')
  body
    block content
    block foot
      #footer
        p some footer content
```

  Now to extend the layout, simply create a new file and use the `extends` directive as shown below, giving the path (with or without the .jade extension). You may now define one or more blocks that will override the parent block content, note that here the `foot` block is _not_ redefined and will output "some footer content".

```jade
extends layout

block scripts
  script(src='/jquery.js')
  script(src='/pets.js')

block content
  h1= title
  each pet in pets
    include pet
```

  It's also possible to override a block to provide additional blocks, as shown in the following example where `content` now exposes a `sidebar` and `primary` block for overriding, or the child template could override `content` all together.

```jade
extends regular-layout

block content
  .sidebar
    block sidebar
      p nothing
  .primary
    block primary
      p nothing
```

<a name="a12"/>
## Block append / prepend

 Jade allows you to _replace_ (default), _prepend_, or _append_ blocks. Suppose for example you have default scripts in a "head" block that you wish to utilize on _every_ page, you might do this:

```jade
html
  head
    block head
      script(src='/vendor/jquery.js')
      script(src='/vendor/caustic.js')
  body
    block content
```

 Now suppose you have a page of your application for a JavaScript game, you want some game related scripts as well as these defaults, you can simply `append` the block:

```jade
extends layout

block append head
  script(src='/vendor/three.js')
  script(src='/game.js')
```

  When using `block append` or `block prepend` the `block` is optional:

```jade
extends layout

append head
  script(src='/vendor/three.js')
  script(src='/game.js')
```

<a name="a13"/>
## Includes

 Includes allow you to statically include chunks of Jade,
 or other content like css, or html which lives in separate files. The classical example is including a header and footer. Suppose we have the following directory structure:

    ./layout.jade
    ./includes/
      ./head.jade
      ./foot.jade

and the following _layout.jade_:

```jade
html
  include includes/head
  body
    h1 My Site
    p Welcome to my super amazing site.
    include includes/foot
```

both includes _includes/head_ and _includes/foot_ are
read relative to the `filename` option given to _layout.jade_,
which should be an absolute path to this file, however Express
does this for you. Include then parses these files, and injects
the AST produced to render what you would expect:

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
such as html or css. By providing an explicit filter name
with `include:`, Jade will read that file in, apply the
[filter](#a7), and insert that content into the output.

```jade
html
  head
    //- css and js have simple filters that wrap them in
        <style> and <script> tags, respectively
    include stylesheet.css
    include script.js
  body
    //- use the "markdown" filter to convert Markdown to HTML
    include:markdown introduction.markdown
    //- html files have no filter and are included verbatim
    include content.html
```

  Include directives may also accept a block, in which case the
  the given block will be appended to the _last_ block defined
  in the file. For example if `head.jade` contains:

```jade
head
  script(src='/jquery.js')
```

 We may append values by providing a block to `include head`
 as shown below, adding the two scripts.

```jade
html
  include head
    script(src='/foo.js')
    script(src='/bar.js')
  body
    h1 test
```

 You may also `yield` within an included template, allowing you to explicitly mark where the block given to `include` will be placed. Suppose for example you wish to prepend scripts rather than append, you might do the following:

```jade
head
  yield
  script(src='/jquery.js')
  script(src='/jquery.ui.js')
```

 Since included Jade is parsed and literally merges the AST, lexically scoped variables function as if the included Jade was written right in the same file. This means `include` may be used as sort of partial, for example suppose we have `user.jade` which utilizes a `user` variable.

```jade
h1= user.name
p= user.occupation
```

We could then simply `include user` while iterating users, and since the `user` variable is already defined within the loop the included template will have access to it.

```jade
users = [{ name: 'Tobi', occupation: 'Ferret' }]

each user in users
  .user
    include user
```

yielding:

```html
<div class="user">
  <h1>Tobi</h1>
  <p>Ferret</p>
</div>
```

If we wanted to expose a different variable name as `user` since `user.jade` references that name, we could simply define a new variable as shown here with `user = person`:

```jade
each person in users
  .user
    user = person
    include user
```

<a name="a14"/>
## Mixins

 Mixins are converted to regular JavaScript functions in
 the compiled template that Jade constructs. Mixins may
 take arguments, though not required:

```jade
mixin list
  ul
    li foo
    li bar
    li baz
```

  Utilizing a mixin without args looks similar, just without a block:

```jade
h2 Groceries
mixin list
```

  Mixins may take one or more arguments as well, the arguments
  are regular javascripts expressions, so for example the following:

```jade
mixin pets(pets)
  ul.pets
    - each pet in pets
      li= pet

mixin profile(user)
  .user
    h2= user.name
    mixin pets(user.pets)
```

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

<a name="a15"/>
## Generated Output

 Suppose we have the following Jade:

```jade
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