
/**
 * Module dependencies.
 */

var bm = require('./common'),
    jade = require('../lib/jade'),
    fs = require('fs');

var str = fs.readFileSync(__dirname + '/example-self.jade', 'ascii');
var fn = jade.compile(str, { self: true });
var n = bm.times;

bm.start('jade self compilation');
while (n--) {
  jade.render(str, {
    filename: 'example-self.jade'
  , self: true
  , locals: bm.locals
  });
}
bm.stop();

var n = bm.times;

bm.start('jade self execution');
while (n--) {
  jade.render(str, {
    filename: 'example-self.jade'
  , self: true
  , cache: true
  , locals: bm.locals
  });
}
bm.stop();

var n = bm.times;

bm.start('jade compile()');
while (n--) {
  fn(bm.locals);
}
bm.stop();
