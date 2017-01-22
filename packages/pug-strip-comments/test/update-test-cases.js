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
        var expected;
        var input = fs.readFileSync(dir + testCase, 'utf8');
        input = lineJSON.parse(input);
        try {
          expected = fs.readFileSync(dir + stem + name + '.expected.json', 'utf8');
          expected = lineJSON.parse(expected);
        } catch (ex) {
          if (ex.code !== 'ENOENT') throw ex;
        }

        var result = strip(input, options);
        try {
          assert.deepEqual(expected, result);
        } catch (ex) {
          console.log('Updating', testCase);
          fs.writeFileSync(dir + stem + name + '.expected.json'. lineJSON.stringify(result));
        }
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
      var expected;
      try {
        expected = fs.readFileSync(edir + stem + 'err.json', 'utf8');
        expected = JSON.parse(expected);
      } catch (ex) {
        if (ex.code !== 'ENOENT') throw ex;
      }

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
      try {
        assert.deepEqual(expected, actual);
      } catch (ex) {
        console.log('Updating', testCase);
        fs.writeFileSync(edir + stem + 'err.json',
                         JSON.stringify(actual, null, '  '));
      }
    });
  }
});
