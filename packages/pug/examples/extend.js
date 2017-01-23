
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/extend.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

var tobi = { name: 'tobi', age: 2 };
var loki = { name: 'loki', age: 1 };
var jane = { name: 'jane', age: 5 };

console.log(fn({
    title: 'pets'
  , pets: [tobi, loki, jane]
}));