
/**
 * Module dependencies.
 */

var bm = require('./common'),
    ejs = require('./ejs/lib/ejs'),
    fs = require('fs');

var str = fs.readFileSync(__dirname + '/example.ejs', 'ascii');

var n = bm.times;
bm.start('ejs compilation');
while (n--) {
    ejs.render(str, { locals: bm.locals });
}
bm.stop();

var n = bm.times;
bm.start('ejs execution');
while (n--) {
    ejs.render(str, { locals: bm.locals, cache: true, filename: 'example.ejs' });
}
bm.stop();