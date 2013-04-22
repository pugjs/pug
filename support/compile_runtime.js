/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * Arguments.
 */

console.log('');

// parse arguments

fs.readFile('lib/runtime.js', 'utf8', function(err, js){
  if (err) throw err;

  var lines = js.split('\n')
    , buffer = true
    , browser = false
    , buf = ''
    , line
    , cond;

  buf += 'jade = (function (exports) {\n';

  for (var i = 0, l = lines.length; i < l; ++i) {
    line = lines[i];

    if (/^ *\/\/ *if *(node|browser)/gm.exec(line)) {
      cond = RegExp.$1;
      buffer = browser = 'browser' == cond;
    } else if (/^ *\/\/ *end/.test(line)) {
      buffer = true;
      browser = false;
    } else if (browser) {
      buf += line.replace(/^( *)\/\//, '$1') + '\n';
    } else if (buffer) {
      buf += line + '\n';
    }
  }

  buf += '\nreturn exports;\n})({});';

  fs.writeFile('runtime.js', buf, function(err){
    if (err) throw err;
    console.log('  \033[90m create : \033[0m\033[36m%s\033[0m', 'runtime.js');
    console.log();
  });
});
