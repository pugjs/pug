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
    sys.puts(' ' + label + ': \x1b[32m' + (+new Date - start) + '\x1b[0m ms');
}

// Setup

var jadeStr = fs.readFileSync(__dirname + '/layout.jade', 'utf8');
var hamlStr = fs.readFileSync(__dirname + '/layout.haml', 'utf8');

// Benchmarks

bm('jade render', function(){
    jade.render(jadeStr, { locals: { title: 'Jade' }});
});

bm('haml.js render', function(){
    haml.render(hamlStr, { locals: { title: 'Haml' }});
});

bm('jade cached', function(){
    jade.render(jadeStr, { cache: true, filename: 'layout.jade', locals: { title: 'Jade' }});
});

bm('haml.js cached', function(){
    haml.render(hamlStr, { cache: true, filename: 'layout.haml', locals: { title: 'Haml' }});
});


