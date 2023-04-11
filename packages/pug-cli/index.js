#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var program = require('commander');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var pug = require('pug');

var basename = path.basename;
var dirname = path.dirname;
var resolve = path.resolve;
var normalize = path.normalize;
var join = path.join;
var relative = path.relative;

// Pug options

var options = {};

// options

program
  .version(
    'pug version: '     + require('pug/package.json').version + '\n' +
    'pug-cli version: ' + require(  './package.json').version
  )
  .usage('[options] [dir|file ...]')
  .option('-O, --obj <str|path>', 'JSON/JavaScript options object or file')
  .option('-o, --out <dir>', 'output the rendered HTML or compiled JavaScript to <dir>')
  .option('-p, --path <path>', 'filename used to resolve includes')
  .option('-b, --basedir <path>', 'path used as root directory to resolve absolute includes')
  .option('-P, --pretty', 'compile pretty HTML output')
  .option('-c, --client', 'compile function for client-side')
  .option('-n, --name <str>', 'the name of the compiled template (requires --client)')
  .option('-D, --no-debug', 'compile without debugging (smaller functions)')
  .option('-w, --watch', 'watch files for changes and automatically re-render')
  .option('-E, --extension <ext>', 'specify the output file extension')
  .option('-s, --silent', 'do not output logs')
  .option('--name-after-file', 'name the template after the last section of the file path (requires --client and overriden by --name)')
  .option('--doctype <str>', 'specify the doctype on the command line (useful if it is not specified by the template)')


program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    # Render all files in the `templates` directory:');
  console.log('    $ pug templates');
  console.log('');
  console.log('    # Create {foo,bar}.html:');
  console.log('    $ pug {foo,bar}.pug');
  console.log('');
  console.log('    # Using `pug` over standard input and output streams');
  console.log('    $ pug < my.pug > my.html');
  console.log('    $ echo \'h1 Pug!\' | pug');
  console.log('');
  console.log('    # Render all files in `foo` and `bar` directories to `/tmp`:');
  console.log('    $ pug foo bar --out /tmp');
  console.log('');
  console.log('    # Specify options through a string:');
  console.log('    $ pug -O \'{"doctype": "html"}\' foo.pug');
  console.log('    # or, using JavaScript instead of JSON');
  console.log('    $ pug -O "{doctype: \'html\'}" foo.pug');
  console.log('');
  console.log('    # Specify options through a file:');
  console.log('    $ echo "exports.doctype = \'html\';" > options.js');
  console.log('    $ pug -O options.js foo.pug');
  console.log('    # or, JSON works too');
  console.log('    $ echo \'{"doctype": "html"}\' > options.json');
  console.log('    $ pug -O options.json foo.pug');
  console.log('');
});

program.parse(process.argv);

// options given, parse them

if (program.obj) {
  options = parseObj(program.obj);
}

/**
 * Parse object either in `input` or in the file called `input`. The latter is
 * searched first.
 */
function parseObj (input) {
  try {
    return require(path.resolve(input));
  } catch (e) {
    var str;
    try {
      str = fs.readFileSync(program.obj, 'utf8');
    } catch (e) {
      str = program.obj;
    }
    try {
      return JSON.parse(str);
    } catch (e) {
      return eval('(' + str + ')');
    }
  }
}

[
  ['path', 'filename'],      // --path
  ['debug', 'compileDebug'], // --no-debug
  ['client', 'client'],      // --client
  ['pretty', 'pretty'],      // --pretty
  ['basedir', 'basedir'],    // --basedir
  ['doctype', 'doctype'],    // --doctype
].forEach(function (o) {
  options[o[1]] = program[o[0]] !== undefined ? program[o[0]] : options[o[1]];
});

// --name

if (typeof program.name === 'string') {
  options.name = program.name;
}

// --silent

var consoleLog = program.silent ? function() {} : console.log;

// left-over args are file paths

var files = program.args;

// object of reverse dependencies of a watched file, including itself if
// applicable

var watchList = {};

// function for rendering
var render = program.watch ? tryRender : renderFile;

// compile files

if (files.length) {
  consoleLog();
  if (program.watch) {
    process.on('SIGINT', function() {
      process.exit(1);
    });
  }
  files.forEach(function (file) {
    render(file);
  });
// stdio
} else {
  stdin();
}

/**
 * Watch for changes on path
 *
 * Renders `base` if specified, otherwise renders `path`.
 */
function watchFile(path, base, rootPath) {
  path = normalize(path);

  var log = '  ' + chalk.gray('watching') + ' ' + chalk.cyan(path);
  if (!base) {
    base = path;
  } else {
    base = normalize(base);
    log += '\n    ' + chalk.gray('as a dependency of') + ' ';
    log += chalk.cyan(base);
  }

  if (watchList[path]) {
    if (watchList[path].indexOf(base) !== -1) return;
    consoleLog(log);
    watchList[path].push(base);
    return;
  }

  consoleLog(log);
  watchList[path] = [base];
  fs.watchFile(path, {persistent: true, interval: 200},
               function (curr, prev) {
    // File doesn't exist anymore. Keep watching.
    if (curr.mtime.getTime() === 0) return;
    // istanbul ignore if
    if (curr.mtime.getTime() === prev.mtime.getTime()) return;
    watchList[path].forEach(function(file) {
      tryRender(file, rootPath);
    });
  });
}

/**
 * Convert error to string
 */
function errorToString(e) {
  return e.stack || /* istanbul ignore next */ (e.message || e);
}

/**
 * Try to render `path`; if an exception is thrown it is printed to stderr and
 * otherwise ignored.
 *
 * This is used in watch mode.
 */
function tryRender(path, rootPath) {
  try {
    renderFile(path, rootPath);
  } catch (e) {
    // keep watching when error occured.
    console.error(errorToString(e) + '\x07');
  }
}

/**
 * Compile from stdin.
 */

function stdin() {
  var buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk){ buf += chunk; });
  process.stdin.on('end', function(){
    var output;
    if (options.client) {
      output = pug.compileClient(buf, options);
    } else {
      var fn = pug.compile(buf, options);
      var output = fn(options);
    }
    process.stdout.write(output);
  }).resume();
}

/**
 * Process the given path, compiling the pug files found.
 * Always walk the subdirectories.
 *
 * @param path      path of the file, might be relative
 * @param rootPath  path relative to the directory specified in the command
 */

function renderFile(path, rootPath) {
  var isPug = /\.(?:pug|jade)$/;
  var isIgnored = /([\/\\]_)|(^_)/;

  var stat = fs.lstatSync(path);
  // Found pug file
  if (stat.isFile() && isPug.test(path) && !isIgnored.test(path)) {
    // Try to watch the file if needed. watchFile takes care of duplicates.
    if (program.watch) watchFile(path, null, rootPath);
    if (program.nameAfterFile) {
      options.name = getNameFromFileName(path);
    }
    var fn = options.client
           ? pug.compileFileClient(path, options)
           : pug.compileFile(path, options);
    if (program.watch && fn.dependencies) {
      // watch dependencies, and recompile the base
      fn.dependencies.forEach(function (dep) {
        watchFile(dep, path, rootPath);
      });
    }

    // --extension
    var extname;
    if (program.extension)   extname = '.' + program.extension;
    else if (options.client) extname = '.js';
    else if (program.extension === '') extname = '';
    else                     extname = '.html';

    // path: foo.pug -> foo.<ext>
    path = path.replace(isPug, extname);
    if (program.out) {
      // prepend output directory
      if (rootPath) {
        // replace the rootPath of the resolved path with output directory
        path = relative(rootPath, path);
      } else {
        // if no rootPath handling is needed
        path = basename(path);
      }
      path = resolve(program.out, path);
    }
    var dir = resolve(dirname(path));
    mkdirp.sync(dir);
    var output = options.client ? fn : fn(options);
    fs.writeFileSync(path, output);
    consoleLog('  ' + chalk.gray('rendered') + ' ' + chalk.cyan('%s'), normalize(path));
  // Found directory
  } else if (stat.isDirectory()) {
    var files = fs.readdirSync(path);
    files.map(function(filename) {
      return path + '/' + filename;
    }).forEach(function (file) {
      render(file, rootPath || path);
    });
  }
}

/**
 * Get a sensible name for a template function from a file path
 *
 * @param {String} filename
 * @returns {String}
 */
function getNameFromFileName(filename) {
  var file = basename(filename).replace(/\.(?:pug|jade)$/, '');
  return file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, function (_, character) {
    return character.toUpperCase();
  }) + 'Template';
}
