# pug-load-async

The pug loader is responsible for loading the depenendencies of a given pug file.  It adds `fullPath` and `str` properties to every `Include` and `Extends` node.  It also adds an `ast` property to any `Include` nodes that are loading pug and any `Extends` nodes.  It then recursively loads the dependencies of any of those included files.

## Installation

    npm install pug-load-async

## Usage

```js
var load = require('pug-load-async');
```

### `await load(ast, options)`
### `await load.string(str, filename, options)`
### `await load.file(filename, options)`

Loads all dependencies of the Pug AST. `load.string` and `load.file` are syntactic sugar that parses the string or file instead of you doing it yourself.

`options` may contain the following properties:

- `lex` (function): **(required)** the lexer used
- `parse` (function): **(required)** the parser used
- `resolve` (function): a function used to override `load.resolve`. Defaults to `load.resolve`.
- `read` (function): a function used to override `load.read`. Defaults to `load.read`.
- `basedir` (string): the base directory of absolute inclusion. This is **required** when absolute inclusion (file name starts with `'/'`) is used. Defaults to undefined.

The `options` object is passed to `load.resolve` and `load.read`, or equivalently `options.resolve` and `options.read`.

### `await load.resolve(filename, source, options)`

Callback used by `pug-load` to resolve the full path of an included or extended file given the path of the source file.

`filename` is the included file. `source` is the name of the parent file that includes `filename`.

This function is not meant to be called from outside of `pug-load`, but rather for you to override.

### `await load.read(filename, options)`

Callback used by `pug-load` to return the contents of a file.

`filename` is the file to read.

This function is not meant to be called from outside of `pug-load`, but rather for you to override.

### `load.validateOptions(options)`

Callback used `pug-load` to ensure the options object is valid. If your overriden `load.resolve` or `load.read` uses a different `options` scheme, you will need to override this function as well.

This function is not meant to be called from outside of `pug-load`, but rather for you to override.

### Example

```js
var fs = require('fs');
var lex = require('pug-lexer');
var parse = require('pug-parser');
var load = require('pug-load-async');

// you can do everything very manually


(async function () {
  var str = fs.readFileSync('bar.pug', 'utf8');
  
  var ast = await load(parse(lex(str, 'bar.pug'), 'bar.pug'), {
    lex: lex,
    parse: parse,
    resolve: function (filename, source, options) {
      console.log('"' + filename + '" file requested from "' + source + '".');
      return load.resolve(filename, source, options);
    }
  });
  
  // or you can do all that in just two steps
  
  var str = fs.readFileSync('bar.pug', 'utf8');
  
  var ast = await load.string(str, 'bar.pug', {
    lex: lex,
    parse: parse,
    resolve: function (filename, source, options) {
      console.log('"' + filename + '" file requested from "' + source + '".');
      return load.resolve(filename, source, options);
    }
  });
  
  // or you can do all that in only one step
  
  var ast = await load.file('bar.pug', {
    lex: lex,
    parse: parse,
    resolve: function (filename, source, options) {
      console.log('"' + filename + '" file requested from "' + source + '".');
      return load.resolve(filename, source, options);
    }
  });
}).then(() => {}, err => {});
```

## License

  MIT
