var assert = require('assert');
var fs = require('fs');
var test = require('testit');
var link = require('../');
var prettyStringify = require('./common').prettyStringify;
var assertObjEqual = require('./common').assertObjEqual;

function testDir (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    if (!/\.input\.json$/.test(name)) return;
    test(name, function () {
      var actual = link(JSON.parse(fs.readFileSync(dir + '/' + name, 'utf8')));
      fs.writeFileSync(dir + '/' + name.replace(/\.input\.json$/, '.actual.json'), prettyStringify(actual));
      var expected = JSON.parse(fs.readFileSync(dir + '/' + name.replace(/\.input\.json$/, '.expected.json'), 'utf8'));
      assertObjEqual(actual, expected);
    });
  });
}

function testDirError (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    if (!/\.input\.json$/.test(name)) return;
    test(name, function () {
      var input = JSON.parse(fs.readFileSync(dir + '/' + name, 'utf8'));
      var err;
      try {
        link(input);
      } catch (ex) {
        err = {
          msg:  ex.msg,
          code: ex.code,
          line: ex.line
        };
      }
      if (!err) throw new Error('Expected error')
      var expectedError = JSON.parse(fs.readFileSync(dir + '/' + name.replace(/\.input\.json$/, '.expected.json')));
      assertObjEqual(err, expectedError);
    });
  });
}

test('cases from pug', function () {
  testDir(__dirname + '/cases');
});

test('special cases', function () {
  testDir(__dirname + '/special-cases');
});

test('error handling', function () {
  testDirError(__dirname + '/errors');
});
