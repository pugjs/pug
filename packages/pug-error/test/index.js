'use strict';

var assert = require('assert');
var test = require('testit');
var error = require('../');

test('with a source', function () {
  test('and a filename', function () {
    var err = error('MY_CODE', 'My message', {line: 3, filename: 'myfile', src: 'foo\nbar\nbaz\nbash\nbing'});
    assert(err.message === 'myfile:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message');
    assert(err.code === 'PUG:MY_CODE');
    assert(err.msg === 'My message');
    assert(err.line === 3);
    assert(err.filename === 'myfile');
    assert(err.src === 'foo\nbar\nbaz\nbash\nbing');
  });
  test('and no filename', function () {
    var err = error('MY_CODE', 'My message', {line: 3, src: 'foo\nbar\nbaz\nbash\nbing'});
    assert(err.message === 'Pug:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message');
    assert(err.code === 'PUG:MY_CODE');
    assert(err.msg === 'My message');
    assert(err.line === 3);
    assert(err.filename === undefined);
    assert(err.src === 'foo\nbar\nbaz\nbash\nbing');
  });
});

test('without source', function () {
  test('and with a filename', function () {
    var err = error('MY_CODE', 'My message', {line: 3, filename: 'myfile'});
    assert(err.message === 'myfile:3\n\nMy message');
    assert(err.code === 'PUG:MY_CODE');
    assert(err.msg === 'My message');
    assert(err.line === 3);
    assert(err.filename === 'myfile');
    assert(err.src === undefined);
  });
  test('and with no filename', function () {
    var err = error('MY_CODE', 'My message', {line: 3});
    assert(err.message === 'Pug:3\n\nMy message');
    assert(err.code === 'PUG:MY_CODE');
    assert(err.msg === 'My message');
    assert(err.line === 3);
    assert(err.filename === undefined);
    assert(err.src === undefined);
  });
});

test('with column', function () {
  test('and with a filename', function () {
    var err = error('MY_CODE', 'My message', {line: 3, column: 2, filename: 'myfile', src: 'foo\nbar\nbaz\nbash\nbing'});
    assert(err.message === 'myfile:3:2\n    1| foo\n    2| bar\n  > 3| baz\n--------^\n    4| bash\n    5| bing\n\nMy message');
    assert(err.code === 'PUG:MY_CODE');
    assert(err.msg === 'My message');
    assert(err.line === 3);
    assert(err.filename === 'myfile');
    assert(err.src === 'foo\nbar\nbaz\nbash\nbing');
  });
  test('and with no filename', function () {
    var err = error('MY_CODE', 'My message', {line: 3, column: 1});
    assert(err.message === 'Pug:3:1\n\nMy message');
    assert(err.code === 'PUG:MY_CODE');
    assert(err.msg === 'My message');
    assert(err.line === 3);
    assert(err.filename === undefined);
    assert(err.src === undefined);
  });
});

test('invalid information', function () {
  test('negative column', function () {
    var err = error('MY_CODE', 'My message', {line: 3, column: -1, src: 'foo\nbar\nbaz\nbash\nbing'});
    assert.strictEqual(err.message, 'Pug:3:-1\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message');
    assert.strictEqual(err.code, 'PUG:MY_CODE');
    assert.strictEqual(err.msg, 'My message');
    assert.strictEqual(err.line, 3);
    assert.strictEqual(err.filename, undefined);
    assert.strictEqual(err.src, 'foo\nbar\nbaz\nbash\nbing');
  })
  test('out of range line', function () {
    check(0);
    check(6);

    function check(line) {
      var err = error('MY_CODE', 'My message', {line: line, src: 'foo\nbar\nbaz\nbash\nbing'});
      assert.strictEqual(err.message, 'Pug:' + line + '\n\nMy message');
      assert.strictEqual(err.code, 'PUG:MY_CODE');
      assert.strictEqual(err.msg, 'My message');
      assert.strictEqual(err.line, line);
      assert.strictEqual(err.filename, undefined);
      assert.strictEqual(err.src, 'foo\nbar\nbaz\nbash\nbing');
    }
  });
});
