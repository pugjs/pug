
var currentLabel,
    startTime;

exports.times = 5000;

exports.start = function(label){
    currentLabel = label;
    startTime = new Date;
};

exports.stop = function(){
    var stopTime = new Date,
        duration = stopTime - startTime;
    console.log('%s: %dms', currentLabel, duration);
};

exports.locals = {
    one: 'one',
    two: 'two',
    three: 'three',
    items: Array(200).join('test ').split(' ')
};

console.log('\nbenchmarking %d times\n', exports.times);