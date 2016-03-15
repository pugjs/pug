
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/whitespace.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

console.log(fn());