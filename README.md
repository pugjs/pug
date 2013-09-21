# [![Jade - template engine ](http://i.imgur.com/5zf2aVt.png)](http://jade-lang.com/)

Full documentation is at [jade-lang.com](http://jade-lang.com/)

 Jade is a high performance template engine heavily influenced by [Haml](http://haml-lang.com)
 and implemented with JavaScript for [node](http://nodejs.org). For discussion join the [Google Group](http://groups.google.com/group/jadejs).

 You can test drive Jade online [here](http://naltatis.github.com/jade-syntax-docs).

 [![Build Status](https://travis-ci.org/visionmedia/jade.png?branch=master)](https://travis-ci.org/visionmedia/jade)
 [![Dependency Status](https://gemnasium.com/visionmedia/jade.png)](https://gemnasium.com/visionmedia/jade)
 [![NPM version](https://badge.fury.io/js/jade.png)](http://badge.fury.io/js/jade)

## Announcements

**Deprecation of implicit script/style text-only:**

 Jade version 0.31.0 deprecated implicit text only support for scripts and styles.  To fix this all you need to do is add a `.` character after the script or style tag.

 It is hoped that this change will make Jade easier for newcomers to learn without affecting the power of the language or leading to excessive verboseness.

 If you have a lot of Jade files that need fixing you can use [fix-jade](https://github.com/ForbesLindesay/fix-jade) to attempt to automate the process.

**Command line option change:**

since `v0.31.0`, `-o` is preferred for `--out` where we used `-O` before.

## Installation

via npm:

```bash
$ npm install jade
```

## Syntax

Jade is a clean, whitespace sensitive syntax for writing html.  Here is a simple example:

```jade
doctype 5
html(lang="en")
  head
    title= pageTitle
    script(type='text/javascript').
      if (foo) bar(1 + 5)
  body
    h1 Jade - node template engine
    #container.col
      if youAreUsingJade
        p You are amazing
      else
        p Get on it!
      p.
        Jade is a terse and simple templating language with a
        strong focus on performance and powerful features.
```

becomes


```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Jade</title>
    <script type="text/javascript">
      if (foo) bar(1 + 5)
    </script>
  </head>
  <body>
    <h1>Jade - node template engine</h1>
    <div id="container" class="col">
      <p>You are amazing</p>
      <p>Jade is a terse and simple templating language with a strong focus on performance and powerful features.</p>
    </div>
  </body>
</html>
```

The official [jade tutorial](http://jade-lang.com/tutorial/) is a great place to start.  While that (and the syntax documentation) is being finished, you can view some of the old documentation [here](https://github.com/visionmedia/jade/blob/master/jade.md) and [here](https://github.com/visionmedia/jade/blob/master/jade-language.md)

## API

For full API, see [jade-lang.com/api](http://jade-lang.com/api/)

```js
var jade = require('jade');

// compile
var fn = jade.compile('string of jade', options);
var html = fn(locals);

// render
var html = jade.render('string of jade', merge(options, locals));

// renderFile
var html = jade.renderFile('filename.jade', merge(options, locals));
```

### Options

 - `filename`  Used in exceptions, and required when using includes
 - `compileDebug`  When `false` no debug instrumentation is compiled
 - `pretty`    Add pretty-indentation whitespace to output _(false by default)_

## Browser Support

 The latest version of jade can be download for the browser in standalone form from [here](https://github.com/visionmedia/jade/raw/master/jade.js).  It only supports the very latest browsers though, and is a large file.  It is recommended that you pre-compile your jade templates to JavaScript and then just use the [runtime.js](https://github.com/visionmedia/jade/raw/master/runtime.js) library on the client.

 To compile a template for use on the client using the command line, do:

```console
$ jade --client --no-debug filename.jade
```

which will produce `filename.js` containing the compiled template.

## Command Line

After installing the latest version of [node](http://nodejs.org/), install with:

```console
$ npm install jade -g
```

and run with

```console
$ jade --help
```

## Additional Resources

Tutorials:

  - cssdeck interactive [Jade syntax tutorial](http://cssdeck.com/labs/learning-the-jade-templating-engine-syntax)
  - cssdeck interactive [Jade logic tutorial](http://cssdeck.com/labs/jade-templating-tutorial-codecast-part-2)
  - in [Japanese](http://blog.craftgear.net/4f501e97c1347ec934000001/title/10%E5%88%86%E3%81%A7%E3%82%8F%E3%81%8B%E3%82%8Bjade%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3)


Implementations in other languages:

  - [php](http://github.com/everzet/jade.php)
  - [scala](http://scalate.fusesource.org/versions/snapshot/documentation/scaml-reference.html)
  - [ruby](https://github.com/slim-template/slim)
  - [python](https://github.com/SyrusAkbary/pyjade)
  - [java](https://github.com/neuland/jade4j)

Other:

  - [Emacs Mode](https://github.com/brianc/jade-mode)
  - [Vim Syntax](https://github.com/digitaltoad/vim-jade)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [Coda/SubEtha syntax Mode](https://github.com/aaronmccall/jade.mode)
  - [Screencasts](http://tjholowaychuk.com/post/1004255394/jade-screencast-template-engine-for-nodejs)
  - [html2jade](https://github.com/donpark/html2jade) converter

## License

MIT
