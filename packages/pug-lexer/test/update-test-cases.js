'use strict';

var fs = require('fs');
var assert = require('assert');
var lex = require('../');

var dir = __dirname + '/cases/';
fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.pug$/.test(testCase)) {
    var expected;
    try {
      expected = fs.readFileSync(dir + testCase.replace(/\.pug$/, '.expected.json'), 'utf8')
                     .split(/\n/).filter(Boolean).map(JSON.parse);
    } catch (ex) {
      if (ex.code !== 'ENOENT') throw ex;
      expected = null;
    }
    var result = lex(fs.readFileSync(dir + testCase, 'utf8'), {filename: __dirname + '/cases/' + testCase});
    try {
      assert.deepEqual(expected, result);
    } catch (ex) {
      console.log('Updating ' + testCase);
      fs.writeFileSync(dir + testCase.replace(/\.pug$/, '.expected.json'),
                       result.map(JSON.stringify).join('\n'));
    }
  }
});

var edir = __dirname + '/errors/';
fs.readdirSync(edir).forEach(function (testCase) {
  if (/\.pug$/.test(testCase)) {
    var expected;
    try {
      expected = JSON.parse(fs.readFileSync(edir + testCase.replace(/\.pug$/, '.json'), 'utf8'));
    } catch (ex) {
      if (ex.code !== 'ENOENT') throw ex;
      expected = null;
    }
    var actual;
    try {
      lex(fs.readFileSync(edir + testCase, 'utf8'), {filename: edir + testCase});
      throw new Error('Expected ' + testCase + ' to throw an exception.');
    } catch (ex) {
      if (!ex || !ex.code || !ex.code.indexOf('PUG:') === 0) throw ex;
      actual = {
        msg: ex.msg,
        code: ex.code,
        line: ex.line,
        column: ex.column
      };
    }
    try {
      assert.deepEqual(expected, actual);
    } catch (ex) {
      console.log('Updating ' + testCase);
      fs.writeFileSync(edir + testCase.replace(/\.pug$/, '.json'),
                      JSON.stringify(actual, null, '  '));
    }
  }
});
