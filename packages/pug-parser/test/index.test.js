'use strict';

var fs = require('fs');
var getRepo = require('get-repo');
var parse = require('../');

var testCases = fs.readdirSync(__dirname + '/cases').filter(function (name) {
  return /\.tokens\.json$/.test(name);
});

function parseNewlineJson(str) {
  return str.split('\n').filter(Boolean).map(JSON.parse)
}

function read(path) {
  return fs.readFileSync(__dirname + '/cases/' + path, 'utf8');
}

testCases.forEach(function (filename) {
  test(filename, () => {
    var actualAst = parse(parseNewlineJson(read(filename)), {filename: filename});
    expect(actualAst).toMatchSnapshot();
  });
});
