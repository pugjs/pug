'use strict';

var fs = require('fs');
var path = require('path');
var lex = require('pug-lexer');
var parse = require('pug-parser');
var load = require('pug-load');
var link = require('../');
var prettyStringify = require('./common').prettyStringify;
var assertObjEqual = require('./common').assertObjEqual;

function removeItem (array, itemToRemove) {
  return array.filter(function (item) {
    return item !== itemToRemove;
  });
}

function updateDir (outDir, originalFileDir, inputFiles) {
  originalFileDir = originalFileDir || outDir;
  inputFiles = inputFiles || fs.readdirSync(originalFileDir).filter(function (name) {
    return /\.pug$/.test(name);
  });
  var existing = fs.readdirSync(outDir).filter(function (name) {
    return /\.input\.json$/.test(name);
  });
  var existingExpected = fs.readdirSync(outDir).filter(function (name) {
    return /\.expected\.json$/.test(name);
  });
  inputFiles.forEach(update);

  function update (pugName) {
    var name = pugName.replace(/\.pug$/, '');
    var inputName = name + '.input.json';
    var expectedName = name + '.expected.json';
    var alreadyExists = existing.indexOf(inputName) !== -1 && existingExpected.indexOf(expectedName) !== -1;
    var actualInputAst = load.file(pugName, {
      lex: lex,
      parse: parse,
      resolve: function (filename, source) {
        filename = filename.trim();
        source = source.trim();

        if (filename[0] === '/') filename = filename.substr(1);
        else filename = path.join(path.dirname(source), filename);

        if (path.basename(filename).indexOf('.') === -1) filename += '.pug';
        filename = path.normalize(filename);
        return filename;
      },
      read: function (filename) {
        return fs.readFileSync(path.join(originalFileDir, filename), 'utf8');
      }
    });
    var actualExpectedAst = link(JSON.parse(JSON.stringify(actualInputAst)));
    if (alreadyExists) {
      existing = removeItem(existing, inputName);
      existingExpected = removeItem(existingExpected, expectedName);
      try {
        var expectedInputAst = JSON.parse(fs.readFileSync(outDir + '/' + inputName, 'utf8'));
        assertObjEqual(actualInputAst, expectedInputAst);
      } catch (ex) {
        console.log('update: ' + inputName);
        fs.writeFileSync(outDir + '/' + inputName, prettyStringify(actualInputAst));
      }
      try {
        var expectedExpectedAst = JSON.parse(fs.readFileSync(outDir + '/' + expectedName, 'utf8'));
        assertObjEqual(actualExpectedAst, expectedExpectedAst);
      } catch (ex) {
        console.log('update: ' + expectedName);
        fs.writeFileSync(outDir + '/' + expectedName, prettyStringify(actualExpectedAst));
      }
    } else {
      console.log('create: ' + inputName);
      fs.writeFileSync(outDir + '/' + inputName, prettyStringify(actualInputAst));
      console.log('create: ' + expectedName);
      fs.writeFileSync(outDir + '/' + expectedName, prettyStringify(actualExpectedAst));
    }
  }
  existing.forEach(function (file) {
    fs.unlinkSync(outDir + '/' + file);
  });
  existingExpected.forEach(function (file) {
    fs.unlinkSync(outDir + '/' + file);
  });
}

function updateDirErrored (outDir, originalFileDir, inputFiles) {
  originalFileDir = originalFileDir || outDir;
  inputFiles = inputFiles || fs.readdirSync(originalFileDir).filter(function (name) {
    return /\.pug$/.test(name);
  });
  var existing = fs.readdirSync(outDir).filter(function (name) {
    return /\.input\.json$/.test(name);
  });
  inputFiles.forEach(update);

  function update (pugName) {
    var name = pugName.replace(/\.pug$/, '');
    var inputName = name + '.input.json';
    var expectedName = name + '.expected.json';
    var alreadyExists = existing.indexOf(inputName) !== -1;
    var actualInputAst = load.file(pugName, {
      lex: lex,
      parse: parse,
      resolve: function (filename, source) {
        filename = filename.trim();
        source = source.trim();

        if (filename[0] === '/') filename = filename.substr(1);
        else filename = path.join(path.dirname(source), filename);

        if (path.basename(filename).indexOf('.') === -1) filename += '.pug';
        filename = path.normalize(filename);
        return filename;
      },
      read: function (filename) {
        return fs.readFileSync(path.join(originalFileDir, filename), 'utf8');
      }
    });
    if (alreadyExists) {
      existing = removeItem(existing, inputName);
      try {
        var expectedInputAst = JSON.parse(fs.readFileSync(outDir + '/' + inputName, 'utf8'));
        assertObjEqual(actualInputAst, expectedInputAst);
      } catch (ex) {
        console.log('update: ' + inputName);
        fs.writeFileSync(outDir + '/' + inputName, prettyStringify(actualInputAst));
      }

      var success = false;
      try {
        link(actualInputAst);
        success = true;
      } catch (ex) {
        if (!ex.code || ex.code.indexOf('PUG') !== 0) throw ex;
        fs.writeFileSync(outDir + '/' + expectedName, JSON.stringify({
          msg:  ex.msg,
          code: ex.code,
          line: ex.line
        }, null, 2));
      }
      if (success) throw new Error(inputName + ' links without error');
    } else {
      console.log('create: ' + inputName);
      fs.writeFileSync(outDir + '/' + inputName, prettyStringify(actualInputAst));
    }
  }
  existing.forEach(function (file) {
    fs.unlinkSync(outDir + '/' + file);
  });
}

updateDir(__dirname + '/cases', __dirname + '/cases-src');

updateDir(__dirname + '/special-cases', __dirname + '/special-cases-src');

updateDirErrored(__dirname + '/errors', __dirname + '/errors-src');

console.log('test cases updated');
