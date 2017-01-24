var assert = require('assert');
var fs = require('fs');
var link = require('../');

function testDir (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    if (!/\.input\.json$/.test(name)) return;
    test(name, function () {
      var actual = link(JSON.parse(fs.readFileSync(dir + '/' + name, 'utf8')));
      expect(actual).toMatchSnapshot();
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
      expect(err).toMatchSnapshot();
    });
  });
}

describe('cases from pug', function () {
  testDir(__dirname + '/cases');
});

describe('special cases', function () {
  testDir(__dirname + '/special-cases');
});

describe('error handling', function () {
  testDirError(__dirname + '/errors');
});
