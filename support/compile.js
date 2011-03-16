
/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * Arguments.
 */

var args = process.argv.slice(2)
  , pending = args.length
  , files = {};

// note about uglify

console.log('');
console.log('  compiling jade.js');
console.log('');
console.log('  NOTE: to compile jade.min.js first `$ npm install uglify-js`');
console.log('  and then execute `$ make jade.min.js`.');
console.log('');

// parse arguments

args.forEach(function(file){
  var mod = file.replace('lib/', '');
  fs.readFile(file, 'utf8', function(err, js){
    if (err) throw err;
    console.log('  \033[90mcompile : \033[0m\033[36m%s\033[0m', file);
    files[file] = parse(js);
    --pending || compile();
  });
});

/**
 * Parse the given `js`, currently supporting:.
 * 
 *    'if' ['node' | 'browser']
 *    'end'
 * 
 */

function parse(js) {
  var lines = js.split('\n')
    , len = lines.length
    , buffer = true
    , buf = []
    , line
    , cond;

  for (var i = 0; i < len; ++i) {
    line = lines[i];
    if (/^\/\/ *if *(node|browser)/gm.exec(line)) {
      cond = RegExp.$1;
      buffer = 'browser' == cond;
    } else if (/^\/\/ *end/.test(line)) {
      buffer = true;
    } else if (buffer) {
      buf.push(line);
    }
  }

  return buf.join('\n');
}

/**
 * Compile the files.
 */

function compile() {
  var buf = '';
  buf += '\n// CommonJS require()\n\n';
  buf += browser.require + '\n\n';
  buf += 'require.modules = {};\n\n';
  buf += 'require.resolve = ' + browser.resolve + ';\n\n';
  buf += 'require.register = ' + browser.register + ';\n\n';
  buf += 'require.relative = ' + browser.relative + ';\n\n';
  args.forEach(function(file){
    var js = files[file];
    file = file.replace('lib/', '');
    buf += '\nrequire.register("' + file + '", function(module, exports, require){\n';
    buf += js;
    buf += '\n}); // module: ' + file + '\n';
  });
  fs.writeFile('jade.js', buf, function(err){
    if (err) throw err;
    console.log('  \033[90m create : \033[0m\033[36m%s\033[0m', 'jade.js');
    console.log();
  });
}

// refactored version of weepy's
// https://github.com/weepy/brequire/blob/master/browser/brequire.js

var browser = {
  
  /**
   * Require a module.
   */
  
  require: function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  },
  
  /**
   * Resolve module path.
   */

  resolve: function(path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  },
  
  /**
   * Return relative require().
   */

  relative: function(parent) {
    return function(p){
      if ('.' != p[0]) return require(p);
      
      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();
      
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  },
  
  /**
   * Register a module.
   */

  register: function(path, fn){
    require.modules[path] = fn;
  }
};