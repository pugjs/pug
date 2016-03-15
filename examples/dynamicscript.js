
/**
 * Module dependencies.
 */

var pug = require('../');

var locals = {
  users: {
    tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
    tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
  }
};

var fn = pug.compileFile(__dirname + '/dynamicscript.pug');
console.log(fn(locals));
