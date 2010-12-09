
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade')
  , str = require('fs').readFileSync(__dirname + '/text.jade', 'utf8')
  , fn = jade.compile(str);

console.log(fn({ name: 'tj', email: 'tj@vision-media.ca' }));