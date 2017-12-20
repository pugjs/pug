'use strict';

var fs = require('fs');
var assert = require('assert');
var getRepo = require('get-repo');
var lex = require('pug-lexer');
var load = require('pug-load');
var parse = require('pug-parser');
var handleFilters = require('../').handleFilters;
var customFilters = require('./custom-filters.js');

var existing = fs.readdirSync(__dirname + '/cases').filter(function (name) {
  return /\.input\.json$/.test(name);
});

function getError (input, filename) {
  try {
    handleFilters(input, customFilters);
    throw new Error('Expected ' + filename + ' to throw an exception.');
  } catch (ex) {
    if (!ex || !ex.code || ex.code.indexOf('PUG:') !== 0) throw ex;
    return {
      msg: ex.msg,
      code: ex.code,
      line: ex.line
    };
  }
}

getRepo('pugjs', 'pug-parser').on('data', function (entry) {
  var match;
  if (entry.type === 'File' && (match = /^\/test\/cases\/(filters.*)\.expected\.json$/.exec(entry.path))) {
    var name = match[1];
    var filename = name + '.input.json';
    var alreadyExists = false;
    existing = existing.filter(function (existingName) {
      if (existingName === filename) {
        alreadyExists = true;
        return false;
      }
      return true;
    });
    if (alreadyExists) {
      var actualInputAst = getLoadedAst(entry.body.toString('utf8'));
      try {
        var expectedInputAst = JSON.parse(fs.readFileSync(__dirname + '/cases/' + filename, 'utf8'));
        assert.deepEqual(expectedInputAst, actualInputAst);
      } catch (ex) {
        console.log('update: ' + filename);
        fs.writeFileSync(__dirname + '/cases/' + filename, JSON.stringify(actualInputAst, null, '  '));
      }

      var actualAstStr = JSON.stringify(handleFilters(actualInputAst, customFilters), null, '  ');
      try {
        var expectedAstStr = fs.readFileSync(__dirname + '/cases/' + name + '.expected.json', 'utf8');
        assert.equal(actualAstStr, expectedAstStr);
      } catch (ex) {
        console.log('update: ' + name + '.expected.json');
        fs.writeFileSync(__dirname + '/cases/' + name + '.expected.json', actualAstStr);
      }
    } else {
      console.log('create: ' + filename);
      var inputAst = getLoadedAst(entry.body.toString('utf8'));
      fs.writeFileSync(__dirname + '/cases/' + filename, JSON.stringify(inputAst, null, '  '));
      console.log('create: ' + name + '.expected.json');
      var ast = handleFilters(inputAst, customFilters);
      fs.writeFileSync(__dirname + '/cases/' + name + '.expected.json', JSON.stringify(ast, null, '  '));
    }
  }
}).on('end', function () {
  existing.forEach(function (file) {
    fs.unlinkSync(__dirname + '/cases/' + file);
  });
  var existingErrors = fs.readdirSync(__dirname + '/errors').filter(function (name) {
    return /\.input\.json$/.test(name);
  });
  var pugRe = /\.pug$/;
  fs.readdirSync(__dirname + '/errors-src').forEach(function (name) {
    if (!pugRe.test(name)) return;
    name = name.replace(pugRe, '');
    var filename = name + '.input.json';
    var alreadyExists = false;
    existingErrors = existingErrors.filter(function (existingName) {
      if (existingName === filename) {
        alreadyExists = true;
        return false;
      }
      return true;
    });
    if (alreadyExists) {
      var actualTokens = parse(lex(fs.readFileSync(__dirname + '/errors-src/' + name + '.pug', 'utf8')));
      try {
        var expectedTokens = JSON.parse(fs.readFileSync(__dirname + '/errors/' + filename, 'utf8'));
        assert.deepEqual(actualTokens, expectedTokens);
      } catch (ex) {
        console.log('update: ' + filename);
        fs.writeFileSync(__dirname + '/errors/' + filename, JSON.stringify(actualTokens, null, '  '));
      }
      var actual = getError(actualTokens, filename);
      try {
        var expected = JSON.parse(fs.readFileSync(__dirname + '/errors/' + name + '.expected.json', 'utf8'));
        assert.deepEqual(actual, expected);
      } catch (ex) {
        console.log('update: ' + name + '.expected.json');
        fs.writeFileSync(__dirname + '/errors/' + name + '.expected.json', JSON.stringify(actual, null, '  '));
      }
    } else {
      console.log('create: ' + filename);
      var ast = parse(lex(fs.readFileSync(__dirname + '/errors-src/' + name + '.pug', 'utf8')));
      fs.writeFileSync(__dirname + '/errors/' + filename, JSON.stringify(ast, null, 2));
      console.log('create: ' + name + '.expected.json');
      var actual = getError(ast, filename);
      fs.writeFileSync(__dirname + '/errors/' + name + '.expected.json', JSON.stringify(actual, null, '  '));
    }
  });
  console.log('test cases updated');
});

function getLoadedAst(str) {
  return load(JSON.parse(str), {
    lex: function () {
      throw new Error('The lexer should not be used');
    },
    parse: function () {
      throw new Error('The parser should not be used');
    },
    resolve: function (filename, source, options) {
      return 'test/cases/' + filename.trim();
    }
  });
}
