'use strict';

var fs = require('fs');
var assert = require('assert');
var testit = require('testit');
var handleFilters = require('../').handleFilters;
var customFilters = require('./custom-filters.js');

var testCases;

testCases = fs.readdirSync(__dirname + '/cases').filter(function (name) {
  return /\.input\.json$/.test(name);
});

testCases.forEach(function (filename) {
  function read (path) {
    return fs.readFileSync(__dirname + '/cases/' + path, 'utf8');
  }
  function write (path, body) {
    return fs.writeFileSync(__dirname + '/cases/' + path, body);
  }

  testit('cases/' + filename, function () {
    var expectedAst = read(filename.replace(/\.input\.json$/, '.expected.json'));
    var actualAst = JSON.stringify(handleFilters(JSON.parse(read(filename)), customFilters), null, '  ');
    write(filename.replace(/\.input\.json$/, '.actual.json'), actualAst);
    assert.equal(actualAst, expectedAst);
  })
});

testCases = fs.readdirSync(__dirname + '/errors').filter(function (name) {
  return /\.input\.json$/.test(name);
});

testCases.forEach(function (filename) {
  function read (path) {
    return fs.readFileSync(__dirname + '/errors/' + path, 'utf8');
  }
  function write (path, body) {
    return fs.writeFileSync(__dirname + '/errors/' + path, body);
  }

  testit('errors/' + filename, function () {
    var expected = JSON.parse(read(filename.replace(/\.input\.json$/, '.expected.json')));
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
    write(filename.replace(/\.input\.json$/, '.actual.json'), JSON.stringify(actual, null, '  '));
    assert.deepEqual(actual, expected);
  })
});
