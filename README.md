<a  href="https://pugjs.org"><img src="https://cdn.rawgit.com/pugjs/pug-logo/eec436cee8fd9d1726d7839cbe99d1f694692c0c/SVG/pug-final-logo-_-colour-128.svg" height="200" align="right"></a>

     
# Pug.js (was Jade)

Pug.js is the leading templating engine for Node.js. But it is also works great for general HTML developers and for Python developers. Like 
[CoffeeScript](https://coffeescript.org/), 
[Python](https://Python.org) and 
[Haml](http://haml.info/), Pug.js uses indentation (whitespace) to define structure, eliminating 
closing tags, and lots of brackets.  This saves typing, reduces errors and makes the 
code much more readable. 


 [![Build Status](https://img.shields.io/travis/pugjs/pug/master.svg?style=flat)](https://travis-ci.org/pugjs/pug)
 [![Coverage Status](https://img.shields.io/coveralls/pugjs/pug/master.svg?style=flat)](https://coveralls.io/r/pugjs/pug?branch=master)
 [![Dependency Status](https://img.shields.io/david/pugjs/pug.svg?style=flat)](https://david-dm.org/pugjs/pug)
 [![devDependencies Status](https://img.shields.io/david/dev/pugjs/pug.svg?style=flat)](https://david-dm.org/pugjs/pug?type=dev)
 [![NPM version](https://img.shields.io/npm/v/pug.svg?style=flat)](https://www.npmjs.com/package/pug)
 [![Join Gitter Chat](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg?style=flat)](https://gitter.im/pugjs/pug?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![OpenCollective](https://opencollective.com/pug/backers/badge.svg)](#backers) 
[![OpenCollective](https://opencollective.com/pug/sponsors/badge.svg)](#sponsors)


- [Pug.js](#pugjs-was-jade)
    - [Syntax](#syntax)
    - [Description](#description)
    - [Release 2.0.0](#release-200-renamed-pug-to-jade)
    - [License](#license)    
    - [Installation](#installation)
        - [Node.js Projects](#nodejs-projects)
        - [Command Line Projects](#command-line-projects)
        - [Installation on the Client](#installation-on-the-client)
    - [API](#api)
        - [Options](#options)
        - [Command Line Invocation](#command-line-invocation)
    - [Tutorials](#tutorials)
- [Related Software](#related-software)
    - [Framework Implementations/adapters](#framework-implementationsadapters)
    - [CMS Plugins](#cms-plugins) 
    - [Editors](#editors)
    - [Servers](#servers)  
- [Implementations In Other Languages](#implementations-in-other-languages)
    - [Ports To Other Languages](#ports-in-other-languages)
    - [Equivalents in other languages](#equivalents-in-other-languages)   
- [Community](#community)    
    - [Backers](#backers)
    - [Sponsors](#sponsors)
  

## Syntax

Pug is a clean, whitespace sensitive syntax for writing HTML.  Here is a simple example:

```pug
doctype html
html(lang="en")
  head
    title= pageTitle
    script(type='text/javascript').
      if (foo) bar(1 + 5)
  body
    h1 Pug - node template engine
    #container.col
      if youAreUsingPug
        p You are amazing
      else
        p Get on it!
      p.
        Pug is a terse and simple templating language with a
        strong focus on performance and powerful features.
```

Pug transforms the above to:


```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Pug</title>
    <script type="text/javascript">
      if (foo) bar(1 + 5)
    </script>
  </head>
  <body>
    <h1>Pug - node template engine</h1>
    <div id="container" class="col">
      <p>You are amazing</p>
      <p>Pug is a terse and simple templating language with a strong focus on performance and powerful features.</p>
    </div>
  </body>
</html>
```

## Description

If you are an HTML developer, the Pug compiler generates HTML which can be served directly.  [See how to generate basic hTML from PUG](https://pythonlinks.info/json-wiki/html-demo/acedemo).

If you are a Javascript developer, the Pug compiler generates javascript which can be run to render the HTML.  Javascript can be directly included in the Pug Template.   [See how to embed javascript in a Pug template](https://pythonlinks.info/json-wiki/pug-demo/acedemo).

If you are a Python developer, the Pug compiler generates Chameleon Page Templates (CPT).  Both Tal: and ${ } statements are respected.  The CPT can then  be rendered at run time to populate it with data.   [See how Pug generates Python's Chameleon Page Templates](https://pythonlinks.info/json-wiki/python-demo/acedemo). There is also a Python version of Pug.js which converts Pug Templates  into Django, Jinja2, Mako or Tornado templates.  

To learn more, [Read the documentation](https://pugjs.org/). 
To try it out, [Take it for a test drive](https://pythonlinks.info/json-wiki/pug-demo/acedemo). 
To discuss it,  join the [chat room](https://gitter.im/pugjs/pug). 
To report a bug, request a feature, or ask a question, [open an issue](https://github.com/pugjs/pug/issues/new). 

[Professionally supported pug is now available](https://tidelift.com/subscription/pkg/npm-pug?utm_source=npm-pug&utm_medium=referral&utm_campaign=readme)


Pug is written in Javascript and it plays well with Javascript. 
Pug templates generate javascript, so it is easy to embed Javascript in Pug. 
The generated Javascript 
can be run on [Node.js](http://nodejs.org) or in the browser to generate the HTML.
All of this makes Pug an excellent choice for web development. 


## Release 2.0.0 (Renamed Pug to Jade)

For release 2.0.0 there is a big name change, and a small syntax change. 

It turned out that Jade is a registered trademark, so now  "pug" is the official package name. 
If your package or app currently uses `jade`, don't worry: we have secured permissions to continue to occupy that package name, although all new versions will be released under `pug`.

The syntax differences are documented in [#2305](https://github.com/pugjs/pug/issues/2305).

## License

Pug.js is released under an MIT License. 


## Installation

### Node.js Projects

To use Pug in your own Node.js projects:

```bash
$ npm install pug
```

### Command Line Projects

If you are not using Node.js, but still want to use Pug from the command line, first install 
the latest version of [Node.js](http://nodejs.org).
The install Pug  with:

```bash
$ npm install pug-cli -g
```

and run with

```bash
$ pug --help
```

### Installation on the Client 

There are several different ways that you can use Pug.js on the client.  Here is [one working example](https://pythonlinks.info/python/about/enhancements/json-wiki/pug-demo/acedemo). 

If you are serving Pug generated HTML, no need to do anything special on the client. 

If you are serving a single Pug Javascript function, which renders a page on the client, there is also 
no need to do anything.  [The Pug runtime](https://github.com/pugjs/pug/blob/master/packages/pug-runtime/index.js)
is included in that javascript function. 

If you are rendering multiple PUG pages on the client, you will have multiple Pug functions.  Rather 
than including a copy of the runtime in each function, you can generate the functions without the runtime.


```
options = {inlineRuntimeFunctions: false}
```
And then just serve a sigle copy of the runtime.  
You can [learn more about the runtime here](https://github.com/pugjs/pug/tree/master/packages/pug-runtime).   

If you want to compile Pug templates in the browser you need to include Pug for the browser.
Here is the latest version of [Pug for the browser in standalone form](https://pugjs.org/js/pug.js).  It only supports the very latest browsers, though, and is a large file, and compilation is comparitively slow, so it is recommended that only the developers do this, and then save and serve the generated javascript. 

## API

There are several ways to use the Pug API.  You can generate the javascript with or without the runtime, either from a 
string, or from a file.  You can render that javascript on the client or on the server.  You can directly render 
the HTML.  You can also compile on the client machine. 

Here are some examples of using the Pug Api 

```js

var pug = require('pug');

// compile pug template into a javascript function
var fn = pug.compile('string of pug', options);

//run the javascript function to generate the html
var html = fn(locals);

// Or you can directly render the html from the Pug template. 
var html = pug.render('string of pug', merge(options, locals));

// Or you can render a file. 
var html = pug.renderFile('filename.pug', merge(options, locals));
```

### Options
Here are the basic ootions:

 - `filename`  Used in exceptions, and required when using includes
 - `compileDebug`  When `false` no debug instrumentation is compiled
 - `pretty`    Add pretty-indentation whitespace to output _(`false` by default)_

The varios options are very nicely documented in the 
[Reference Documentation](https://pugjs.org/api/reference.html)  


### Command Line Invocation
You can also invoke Pug from the command line. There are a number of commands. 

 To compile a template for use on the client using the command line, do:

```bash
$ pug --client --no-debug filename.pug
```

which will produce `filename.js` containing the compiled template.

## Tutorials

  - cssdeck interactive [Pug syntax tutorial](http://cssdeck.com/labs/learning-the-jade-templating-engine-syntax)
  - cssdeck interactive [Pug logic tutorial](http://cssdeck.com/labs/jade-templating-tutorial-codecast-part-2)
  - [Pug について。](https://gist.github.com/japboy/5402844) (A Japanese Tutorial)

## Related Software

### Framework implementations/adapters

Embedded view engines for frameworks:

  - [Laravel](https://github.com/BKWLD/laravel-pug)
  - [Symfony](https://github.com/pug-php/pug-symfony)
  - [Phalcon](https://github.com/pug-php/pug-phalcon)
  - [CodeIgniter](https://github.com/pug-php/ci-pug-engine)
  - [Yii 2](https://github.com/pug-php/pug-yii2)
  - [Slim 3](https://github.com/pug-php/pug-slim)
  - [Silex (implementation example)](https://gist.github.com/kylekatarnls/ba13e4361ab14f4ff5d2a5775eb0cc10)
  - [Lumen](https://github.com/BKWLD/laravel-pug#use-in-lumen)
  - [Rails](https://github.com/yivo/pug-rails)

### CMS plugins

  - [WordPress](https://github.com/welaika/wordless)

## Editors

  - [Emacs Mode](https://github.com/brianc/jade-mode)
  - [Vim Syntax](https://github.com/digitaltoad/vim-pug)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [Coda/SubEtha syntax Mode](https://github.com/aaronmccall/jade.mode
  )
## Servers  
  - [html2pug](https://github.com/donpark/html2jade) converter
  - [pug2php](https://github.com/SE7ENSKY/jade2php) converter
  - [Pug Server](https://github.com/ctrlaltdev/pug-server) Ideal for building local prototypes apart from any application
  - [cache-pug-templates](https://github.com/ladjs/cache-pug-templates) Cache Pug templates for 
  [Lad](https://github.com/ladjs/lad)/[Koa](https://github.com/koajs/koa)/
  [Express](https://github.com/expressjs/express)/
  [Connect](https://github.com/senchalabs/connect) with [Redis](https://redis.io)

## Implementations in Other Languages

### Ports in other languages

Ports to other languages, with very close syntax:

  - [PHP](https://github.com/pug-php/pug)
  - [Java](https://github.com/neuland/jade4j)
  - [Python](https://github.com/kakulukia/pypugjs)
  - [Ruby](https://github.com/yivo/pug-ruby)
  - [C# (ASP.NET Core)](https://github.com/AspNetMonsters/pugzor)
  - [RPG/ILE](https://github.com/WorksOfLiam/apug)

### Equivalents in other languages

Templates engines for other languages with a different syntax, but a similar philosophy:

  - [Scaml for Scala](https://scalate.github.io/scalate/documentation/scaml-reference.html)
  - [Slim for Ruby](https://github.com/slim-template/slim) (should not be confused with Slim PHP framework)
  - [HAML for Ruby](http://haml.info)
# Community

## Backers
Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/pug#backer)]

<a href="https://opencollective.com/pug/backer/0/website" target="_blank"><img src="https://opencollective.com/pug/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/1/website" target="_blank"><img src="https://opencollective.com/pug/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/2/website" target="_blank"><img src="https://opencollective.com/pug/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/3/website" target="_blank"><img src="https://opencollective.com/pug/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/4/website" target="_blank"><img src="https://opencollective.com/pug/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/5/website" target="_blank"><img src="https://opencollective.com/pug/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/6/website" target="_blank"><img src="https://opencollective.com/pug/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/7/website" target="_blank"><img src="https://opencollective.com/pug/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/8/website" target="_blank"><img src="https://opencollective.com/pug/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/9/website" target="_blank"><img src="https://opencollective.com/pug/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/10/website" target="_blank"><img src="https://opencollective.com/pug/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/11/website" target="_blank"><img src="https://opencollective.com/pug/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/12/website" target="_blank"><img src="https://opencollective.com/pug/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/13/website" target="_blank"><img src="https://opencollective.com/pug/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/14/website" target="_blank"><img src="https://opencollective.com/pug/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/15/website" target="_blank"><img src="https://opencollective.com/pug/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/16/website" target="_blank"><img src="https://opencollective.com/pug/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/17/website" target="_blank"><img src="https://opencollective.com/pug/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/18/website" target="_blank"><img src="https://opencollective.com/pug/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/19/website" target="_blank"><img src="https://opencollective.com/pug/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/20/website" target="_blank"><img src="https://opencollective.com/pug/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/21/website" target="_blank"><img src="https://opencollective.com/pug/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/22/website" target="_blank"><img src="https://opencollective.com/pug/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/23/website" target="_blank"><img src="https://opencollective.com/pug/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/24/website" target="_blank"><img src="https://opencollective.com/pug/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/25/website" target="_blank"><img src="https://opencollective.com/pug/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/26/website" target="_blank"><img src="https://opencollective.com/pug/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/27/website" target="_blank"><img src="https://opencollective.com/pug/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/28/website" target="_blank"><img src="https://opencollective.com/pug/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/pug/backer/29/website" target="_blank"><img src="https://opencollective.com/pug/backer/29/avatar.svg"></a>

## Sponsors
Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/pug#sponsor)]

<a href="https://opencollective.com/pug/sponsor/0/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/1/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/2/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/3/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/4/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/5/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/6/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/7/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/8/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/9/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/10/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/11/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/12/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/13/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/14/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/15/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/16/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/17/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/18/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/19/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/20/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/21/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/22/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/23/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/24/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/25/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/26/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/27/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/28/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/pug/sponsor/29/website" target="_blank"><img src="https://opencollective.com/pug/sponsor/29/avatar.svg"></a>

