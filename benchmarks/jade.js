
/**
 * Module dependencies.
 */

var bm = require('./common'),
    jade = require('../lib/jade'),
    fs = require('fs');

var str = fs.readFileSync(__dirname + '/example.jade', 'ascii');
var n = bm.times;

bm.start('jade compilation');
while (n--) {
    jade.render(str, {
        filename: 'example.jade',
        locals: bm.locals
    });
}
bm.stop();

var n = bm.times;

bm.start('jade execution');
while (n--) {
    jade.render(str, {
        filename: 'example.jade',
        cache: true,
        locals: bm.locals
    });
}
bm.stop();