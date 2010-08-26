
/**
 * Module dependencies.
 */

var sys = require('sys');

var currentLabel,
    startTime;

exports.times = 5000;

exports.start = function(label){
    currentLabel = label;
    startTime = new Date;
    sys.print('  - \x1b[33m' + currentLabel + '\x1b[0m: ');
};

exports.stop = function(){
    var stopTime = new Date,
        duration = stopTime - startTime;
    sys.print(duration + ' ms\n');
};

exports.locals = {
    one: 'one',
    two: 'two',
    three: 'three',
    items: Array(200).join('test ').split(' ')
};

console.log('\nbenchmarking %d times\n', exports.times);