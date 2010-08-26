
/**
 * Module dependencies.
 */

var bm = require('./common'),
    haml = require('./haml/lib/haml'),
    fs = require('fs');

var str = fs.readFileSync(__dirname + '/example2.haml', 'ascii');

var n = bm.times;
bm.start('haml compilation');
while (n--) {
    haml.render(str, {
        locals: bm.locals
    });
}
bm.stop();

var n = bm.times;
bm.start('haml execution');
while (n--) {
    haml.render(str, {
        locals: bm.locals,
        cache: true,
        filename: 'example2.haml'
    });
}
bm.stop();