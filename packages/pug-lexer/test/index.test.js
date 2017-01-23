'use strict';

var fs = require('fs');
var assert = require('assert');
var lex = require('../');

var dir = __dirname + '/cases/';
fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.pug$/.test(testCase)) {
    test(testCase, () => {
      var result = lex(fs.readFileSync(dir + testCase, 'utf8'), {filename: dir + testCase});
      expect(result).toMatchSnapshot();
    });
  }
});


var edir = __dirname + '/errors/';
fs.readdirSync(edir).forEach(function (testCase) {
  if (/\.pug$/.test(testCase)) {
    test(testCase, () => {
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
      expect(actual).toMatchSnapshot();
    });
  }
});
