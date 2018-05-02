'use strict';

var jstransformer = require('jstransformer');
var uglify = require('uglify-js');
var CleanCSS = require('clean-css');
var resolve = require('resolve');

module.exports = filter;
function filter(name, str, options, currentDirectory, funcName) {
  funcName = funcName || 'render';
  var trPath;
  try {
    try {
      trPath = resolve.sync('jstransformer-' + name, {basedir: currentDirectory || process.cwd()});
    } catch (ex) {
      trPath = require.resolve('jstransformer-' + name);
    }
  } catch (ex) {
    var err = new Error('unknown filter ":' + name + '"');
    err.code = 'UNKNOWN_FILTER';
    throw err;
  }
  var tr = jstransformer(require(trPath));
  // TODO: we may want to add a way for people to separately specify "locals"
  var result = tr[funcName](str, options, options).body;
  if (options && options.minify) {
    try {
      switch (tr.outputFormat) {
        case 'js':
          result = uglify.minify(result, {fromString: true}).code;
          break;
        case 'css':
          result = new CleanCSS().minify(result).styles;
          break;
      }
    } catch (ex) {
      // better to fail to minify than output nothing
    }
  }
  return result;
}
