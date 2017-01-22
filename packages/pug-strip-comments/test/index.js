'use strict';

var fs = require('fs');
var assert = require('assert');
var testit = require('testit');
var lineJSON = require('line-json');
var strip = require('../');

var dir = __dirname + '/cases/';
fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.input\.json$/.test(testCase)) {
    testit(testCase, function () {
      var stem = testCase.replace(/\.input\.json$/, '.');

      function test (name, options) {
        var input = fs.readFileSync(dir + testCase, 'utf8');
        input = lineJSON.parse(input);
        var expected = fs.readFileSync(dir + stem + name + '.expected.json', 'utf8');
        expected = lineJSON.parse(expected);

        var result = strip(input, options);
        fs.writeFileSync(dir + stem + name + '.actual.json', lineJSON.stringify(result));
        assert.deepEqual(expected, result);
      }

      test('unbuffered');
      test('buffered',   { stripBuffered: true, stripUnbuffered: false });
      test('both',       { stripBuffered: true });
    });
  }
});

var edir = __dirname + '/errors/';
fs.readdirSync(edir).forEach(function (testCase) {
  if (/\.input\.json$/.test(testCase)) {
    testit(testCase, function () {
      var stem = testCase.replace(/\.input\.json$/, '.');

      var input = fs.readFileSync(edir + testCase, 'utf8');
      input = lineJSON.parse(input);
      var expected = fs.readFileSync(edir + stem + 'err.json', 'utf8');
      expected = JSON.parse(expected);

      var actual;
      try {
        strip(input);
        throw new Error('Expected ' + testCase + ' to throw an exception.');
      } catch (ex) {
        if (!ex || !ex.code || !ex.code.indexOf('PUG:') === 0) throw ex;
        actual = {
          msg: ex.msg,
          code: ex.code,
          line: ex.line
        };
      }
      assert.deepEqual(expected, actual);
    });
  }
});
