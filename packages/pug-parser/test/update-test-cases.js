'use strict';

var fs = require('fs');
var assert = require('assert');
var getRepo = require('get-repo');
var parse = require('../');

var existing = fs.readdirSync(__dirname + '/cases').filter(function (name) {
  return /\.tokens\.json$/.test(name);
});

function parseNewlineJson(str) {
  return str.split('\n').filter(Boolean).map(JSON.parse)
}

getRepo('pugjs', 'pug-lexer').on('data', function (entry) {
  var match;
  if (entry.type === 'File' && (match = /^\/test\/cases\/(.*)\.expected\.json$/.exec(entry.path))) {
    var name = match[1];
    var filename = name + '.tokens.json';
    var alreadyExists = false;
    existing = existing.filter(function (existingName) {
      if (existingName === filename) {
        alreadyExists = true;
        return false;
      }
      return true;
    });
    if (alreadyExists) {
      try {
        var expectedTokens = parseNewlineJson(fs.readFileSync(__dirname + '/cases/' + filename, 'utf8'));
        var actualTokens = parseNewlineJson(entry.body.toString('utf8'));
        assert.deepEqual(actualTokens, expectedTokens);
      } catch (ex) {
        console.log('update: ' + filename);
        fs.writeFileSync(__dirname + '/cases/' + filename, entry.body);
      }
      var actualAst = parse(parseNewlineJson(entry.body.toString('utf8')), {filename: filename});
      try {
        var expectedAst = JSON.parse(fs.readFileSync(__dirname + '/cases/' + name + '.expected.json', 'utf8'));
        assert.deepEqual(actualAst, expectedAst);
      } catch (ex) {
        console.log('update: ' + name + '.expected.json');
        fs.writeFileSync(__dirname + '/cases/' + name + '.expected.json', JSON.stringify(actualAst, null, '  '));
      }
    } else {
      console.log('create: ' + filename);
      fs.writeFileSync(__dirname + '/cases/' + filename, entry.body);
      console.log('create: ' + name + '.expected.json');
      var ast = parse(parseNewlineJson(entry.body.toString('utf8')), {filename: filename});
      fs.writeFileSync(__dirname + '/cases/' + name + '.expected.json', JSON.stringify(ast, null, '  '));
    }
  }
}).on('end', function () {
  existing.forEach(function (file) {
    fs.unlinkSync(__dirname + '/cases/' + file);
  });
  console.log('test cases updated');
});
