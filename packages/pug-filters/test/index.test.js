'use strict';

var fs = require('fs');
var assert = require('assert');
var handleFilters = require('../').handleFilters;
var customFilters = require('./custom-filters.js');

process.chdir(__dirname + '/../');

var testCases;

testCases = fs.readdirSync(__dirname + '/cases').filter(function (name) {
  return /\.input\.json$/.test(name);
});
//
testCases.forEach(function (filename) {
  function read (path) {
    return fs.readFileSync(__dirname + '/cases/' + path, 'utf8');
  }

  test('cases/' + filename, function () {
    var actualAst = JSON.stringify(handleFilters(JSON.parse(read(filename)), customFilters), null, '  ');
    expect(actualAst).toMatchSnapshot();
  })
});

testCases = fs.readdirSync(__dirname + '/errors').filter(function (name) {
  return /\.input\.json$/.test(name);
});

testCases.forEach(function (filename) {
  function read (path) {
    return fs.readFileSync(__dirname + '/errors/' + path, 'utf8');
  }

  test('errors/' + filename, function () {
    var actual;
    try {
      handleFilters(JSON.parse(read(filename)), customFilters);
      throw new Error('Expected ' + filename + ' to throw an exception.');
    } catch (ex) {
      if (!ex || !ex.code || !ex.code.indexOf('PUG:') === 0) throw ex;
      actual = {
        msg: ex.msg,
        code: ex.code,
        line: ex.line
      };
    }
    expect(actual).toMatchSnapshot();
  })
});
