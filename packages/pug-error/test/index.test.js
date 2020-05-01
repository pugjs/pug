'use strict';

var assert = require('assert');
var error = require('../');

describe('with a source', function() {
  test('and a filename', function() {
    var err = error('MY_CODE', 'My message', {
      line: 3,
      filename: 'myfile',
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'myfile:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe('myfile');
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
  test('and no filename', function() {
    var err = error('MY_CODE', 'My message', {
      line: 3,
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'Pug:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
});

describe('without source', function() {
  test('and with a filename', function() {
    var err = error('MY_CODE', 'My message', {line: 3, filename: 'myfile'});
    expect(err.message).toBe('myfile:3\n\nMy message');
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe('myfile');
    expect(err.src).toBe(undefined);
  });
  test('and with no filename', function() {
    var err = error('MY_CODE', 'My message', {line: 3});
    expect(err.message).toBe('Pug:3\n\nMy message');
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe(undefined);
  });
});

describe('with column', function() {
  test('and with a filename', function() {
    var err = error('MY_CODE', 'My message', {
      line: 3,
      column: 2,
      filename: 'myfile',
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'myfile:3:2\n    1| foo\n    2| bar\n  > 3| baz\n--------^\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe('myfile');
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
  test('and with no filename', function() {
    var err = error('MY_CODE', 'My message', {line: 3, column: 1});
    expect(err.message).toBe('Pug:3:1\n\nMy message');
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe(undefined);
  });
});

describe('invalid information', function() {
  test('negative column', function() {
    var err = error('MY_CODE', 'My message', {
      line: 3,
      column: -1,
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'Pug:3:-1\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
  test('out of range line', function() {
    check(0);
    check(6);

    function check(line) {
      var err = error('MY_CODE', 'My message', {
        line: line,
        src: 'foo\nbar\nbaz\nbash\nbing',
      });
      expect(err.message).toBe('Pug:' + line + '\n\nMy message');
      expect(err.code).toBe('PUG:MY_CODE');
      expect(err.msg).toBe('My message');
      expect(err.line).toBe(line);
      expect(err.filename).toBe(undefined);
      expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
    }
  });
});
