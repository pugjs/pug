'use strict';

var fs = require('fs');
var assert = require('assert');
var lineJSON = require('line-json');
var strip = require('../');

var dir = __dirname + '/cases/';
fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.input\.json$/.test(testCase)) {
    test(testCase, function () {
      var stem = testCase.replace(/\.input\.json$/, '.');

      function test (name, options) {
        var input = fs.readFileSync(dir + testCase, 'utf8');
        input = lineJSON.parse(input);

        var result = strip(input, options);
        expect(result).toMatchSnapshot();
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
    test(testCase, function () {
      var stem = testCase.replace(/\.input\.json$/, '.');

      var input = fs.readFileSync(edir + testCase, 'utf8');
      input = lineJSON.parse(input);

      try {
        strip(input);
        throw new Error('Expected ' + testCase + ' to throw an exception.');
      } catch (ex) {
        if (!ex || !ex.code || ex.code.indexOf('PUG:') !== 0) throw ex;
        expect({
          msg: ex.msg,
          code: ex.code,
          line: ex.line
        }).toMatchSnapshot();
      }
    });
  }
});
