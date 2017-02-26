
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/text.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

console.log(fn({ name: 'tj', email: 'tj@vision-media.ca' }));