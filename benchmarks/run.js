#!/usr/bin/env node

/**
 * Module dependencies.
 */

var sys = require('sys'),
    fs = require('fs'),
    jade = require('./../lib/jade'),
    haml = require('./haml/lib/haml');

/**
 * Iterations.
 */

var times = 1000;
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
var hamlStr = fs.readFileSync(__dirname + '/layout.haml', 'utf8');

// Jade

bm('jade', function(){
    jade.render(jadeStr);
});

bm('haml.js', function(){
    haml.render(hamlStr);
});

