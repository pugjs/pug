
/**
 * Module dependencies.
 */

var jade = require('../');

var locals = {
  users: {
    tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
    tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
  }
};

var fn = jade.compileFile(__dirname + '/dynamicscript.jade');
console.log(fn(locals));
