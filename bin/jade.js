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
  , exists = fs.existsSync || path.existsSync
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
  if (exists(program.obj)) {
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
      } catch (ex) {
        // keep watching when error occured.
        console.error(ex.stack || ex.message || ex);
      }
      fs.watchFile(filename, {persistent: true, interval: 200}, function (filename) {
        try {
          renderFile(filename);
        } catch (ex) {
          // keep watching when error occured.
          console.error(ex.stack || ex.message || ex);
        }
      });
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
  options.filename = '-';
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
  fs.lstat(path, function(err, stat) {
    if (err) throw err;
    // Found jade file
    if (stat.isFile() && re.test(path)) {
      fs.readFile(path, 'utf8', function(err, str){
        if (err) throw err;
        options.filename = path;
        if (program.nameAfterFile) {
          options.name = getNameFromFileName(path);
        }
        var fn = options.client ? jade.compileClient(str, options) : jade.compile(str, options);
        var extname = options.client ? '.js' : '.html';
        path = path.replace(re, extname);
        if (program.out) path = join(program.out, basename(path));
        var dir = resolve(dirname(path));
        mkdirp(dir, 0755, function(err){
          if (err) throw err;
          try {
            var output = options.client ? fn : fn(options);
            fs.writeFile(path, output, function(err){
              if (err) throw err;
              console.log('  \033[90mrendered \033[36m%s\033[0m', path);
            });
          } catch (e) {
            if (options.watch) {
              console.error(e.stack || e.message || e);
            } else {
              throw e
            }
          }
        });
      });
    // Found directory
    } else if (stat.isDirectory()) {
      fs.readdir(path, function(err, files) {
        if (err) throw err;
        files.map(function(filename) {
          return path + '/' + filename;
        }).forEach(renderFile);
      });
    }
  });
}

/**
 * Get a sensible name for a template function from a file path
 *
 * @param {String} filename
 * @returns {String}
 */
function getNameFromFileName(filename) {
  var file = path.basename(filename, '.jade');
  return file.toLowerCase().replace(/[^a-z0-9]+([a-z])/g, function (_, character) {
    return character.toUpperCase();
  }) + 'Template';
}
