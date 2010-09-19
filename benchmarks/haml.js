
/**
 * Module dependencies.
 */

var bm = require('./common'),
    haml = require('./haml-js/lib/haml'),
    fs = require('fs');

var str = fs.readFileSync(__dirname + '/example.haml', 'ascii');

var n = bm.times;
bm.start('haml-js compilation');
while (n--) {
    haml(str);
}
bm.stop();

var n = bm.times;
var fn = haml(str);
bm.start('haml-js execution');
while (n--) {
    fn.call('whatever scope', bm.locals);
}
bm.stop();