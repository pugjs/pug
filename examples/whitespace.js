
/**
 * Module dependencies.
 */

var jade = require('./../')
  , path = __dirname + '/whitespace.jade'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = jade.compile(str, { filename: path, pretty: true });

console.log(fn());