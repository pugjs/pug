#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs')
  , program = require('commander')
  , path = require('path')
  , basename = path.basename
  , dirname = path.dirname
  , resolve = path.resolve
  , join = path.join
  , mkdirp = require('mkdirp')
  , jade = require('../');

// jade options

var options = {};

// options

program
  .version(require('../package.json').version)
  .usage('[options] [dir|file ...]')
  .option('-O, --obj <str>', 'javascript options object')
  .option('-o, --out <dir>', 'output the compiled html to <dir>')
  .option('-p, --path <path>', 'filename used to resolve includes')
  .option('-P, --pretty', 'compile pretty html output')
  .option('-c, --client', 'compile function for client-side runtime.js')
  .option('-n, --name <str>', 'The name of the compiled template (requires --client)')
  .option('-D, --no-debug', 'compile without debugging (smaller functions)')
  .option('-w, --watch', 'watch files for changes and automatically re-render')
  .option('-E, --extension <extension>', 'specify the output file extension')
  .option('--name-after-file', 'Name the template after the last section of the file path (requires --client and overriden by --name)')
  .option('--doctype <str>', 'Specify the doctype on the command line (useful if it is not specified by the template)')


program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    # translate jade the templates dir');
  console.log('    $ jade templates');
  console.log('');
  console.log('    # create {foo,bar}.html');
  console.log('    $ jade {foo,bar}.jade');
  console.log('');
  console.log('    # jade over stdio');
  console.log('    $ jade < my.jade > my.html');
  console.log('');
  console.log('    # jade over stdio');
  console.log('    $ echo \'h1 Jade!\' | jade');
  console.log('');
  console.log('    # foo, bar dirs rendering to /tmp');
  console.log('    $ jade foo bar --out /tmp ');
  console.log('');
});

program.parse(process.argv);

// options given, parse them

if (program.obj) {
  if (fs.existsSync(program.obj)) {
    options = JSON.parse(fs.readFileSync(program.obj));
  } else {
    options = eval('(' + program.obj + ')');
  }
}

// --filename

if (program.path) options.filename = program.path;

// --no-debug

options.compileDebug = program.debug;

// --client

options.client = program.client;

// --pretty

options.pretty = program.pretty;

// --watch

options.watch = program.watch;

// --name

if (typeof program.name === 'string') {
  options.name = program.name;
}

// --doctype

options.doctype = program.doctype;

// left-over args are file paths

var files = program.args;

// compile files

if (files.length) {
  console.log();
  if (options.watch) {
    files.forEach(function(filename) {
      try {
        renderFile(filename);
      } catch (e) {
        // keep watching when error occured.
        console.error(e.stack || e.message || e);
      }
      fs.watchFile(filename, {persistent: true, interval: 200},
                   function (curr, prev) {
        if (curr.mtime.getTime() === prev.mtime.getTime()) return;
        try {
          renderFile(filename);
        } catch (e) {
          // keep watching when error occured.
          console.error(e.stack || e.message || e);
        }
      });
    });
    process.on('SIGINT', function() {
      process.exit(1);
    });
  } else {
    files.forEach(renderFile);
  }
  process.on('exit', function () {
    console.log();
  });
// stdio
} else {
  stdin();
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
      output = jade.compileClient(buf, options);
    } else {
      var fn = jade.compile(buf, options);
      var output = fn(options);
    }
    process.stdout.write(output);
  }).resume();

  process.on('SIGINT', function() {
    process.stdout.write('\n');
    process.stdin.emit('end');
    process.stdout.write('\n');
    process.exit();
  })
}

/**
 * Process the given path, compiling the jade files found.
 * Always walk the subdirectories.
 */

function renderFile(path) {
  var re = /\.jade$/;
  var stat = fs.lstatSync(path);
  // Found jade file/\.jade$/
  if (stat.isFile() && re.test(path)) {
    var str = fs.readFileSync(path, 'utf8');
    options.filename = path;
    if (program.nameAfterFile) {
      options.name = getNameFromFileName(path);
    }
    var fn = options.client ? jade.compileClient(str, options) : jade.compile(str, options);

    // --extension
    if (program.extension)   var extname = '.' + program.extension;
    else if (options.client) var extname = '.js';
    else                     var extname = '.html';

    path = path.replace(re, extname);
    if (program.out) path = join(program.out, basename(path));
    var dir = resolve(dirname(path));
    mkdirp.sync(dir, 0755);
    var output = options.client ? fn : fn(options);
    fs.writeFileSync(path, output);
    console.log('  \033[90mrendered \033[36m%s\033[0m', path);
  // Found directory
  } else if (stat.isDirectory()) {
    var files = fs.readdirSync(path);
    files.map(function(filename) {
      return path + '/' + filename;
    }).forEach(renderFile);
  }
}

/**
 * Get a sensible name for a template function from a file path
 *
 * @param {String} filename
 * @returns {String}
 */
function getNameFromFileName(filename) {
  var file = basename(filename, '.jade');
  return file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, function (_, character) {
    return character.toUpperCase();
  }) + 'Template';
}
