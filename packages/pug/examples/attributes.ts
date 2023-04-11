/**
 * Module dependencies.
 */

var pug = require('../'),
  path = __dirname + '/attributes.pug',
  str = require('fs').readFileSync(path, 'utf8'),
  fn = pug.compile(str, {filename: path, pretty: true});

console.log(fn({name: 'tj'}));
