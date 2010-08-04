
var jade = require('./lib/jade'),
    str = require('fs').readFileSync(__dirname + '/examples/whitespace.jade', 'utf8'),
    times = 5000;

console.log('rendering ' + times + ' times');

var start = new Date;
while (times--) {
    jade.render(str);
}

console.log('took ' + (new Date - start) + 'ms');