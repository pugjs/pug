'use strict';

var fs = require('fs');
var assert = require('assert');
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
function write(path, body) {
  return fs.writeFileSync(__dirname + '/cases/' + path, body);
}

testCases.forEach(function (filename) {
  console.dir(filename);
  var expectedAst = JSON.parse(read(filename.replace(/\.tokens\.json$/, '.expected.json')));
  var actualAst = parse(parseNewlineJson(read(filename)), {filename: filename});
  write(filename.replace(/\.tokens\.json$/, '.actual.json'), JSON.stringify(actualAst, null, '  '));
  assert.deepEqual(actualAst, expectedAst);
});

console.log('tests passed');
