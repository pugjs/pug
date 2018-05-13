
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/form.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

var user = {
  name: 'TJ',
  email: 'tj@vision-media.ca',
  city: 'Victoria',
  province: 'BC'
};

console.log(fn({ user: user }));