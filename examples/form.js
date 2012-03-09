
/**
 * Module dependencies.
 */

var jade = require('../')
  , path = __dirname + '/form.jade'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = jade.compile(str, { filename: path, pretty: true });

var user = {
  name: 'TJ',
  email: 'tj@vision-media.ca',
  city: 'Victoria',
  province: 'BC'
};

console.log(fn({ user: user }));