#!/usr/bin/env node

/**
 * Module dependencies.
 */

var sys = require('sys'),
    fs = require('fs'),
    jade = require('./../lib/jade');

/**
 * Iterations.
 */

var times = 500;
sys.puts('running ' + times + ' times.');

/**
 * Run benchmarks,
 *
 * @param {String} label
 * @param {Function} fn
 */

function bm(label, fn) {
    var n = times,
        start = +new Date,
        dotAt = times / 10;
    while (n--) {
        if (n % dotAt === 0) sys.print('.');
        fn();
    }
    sys.puts(' ' + label + ': ' + (+new Date - start) + 'ms');
}

// Setup

var jadeStr = fs.readFileSync(__dirname + '/layout.jade', 'utf8');

// Jade

bm('jade', function(){
    jade.render(jadeStr);
});