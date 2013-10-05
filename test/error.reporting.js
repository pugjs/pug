
/**
 * Module dependencies.
 */

var jade = require('../')
  , assert = require('assert')
  , fs = require('fs');

// Shortcut

function getError(str, options){
  try {
    jade.render(str, options);
  } catch (ex) {
    return ex;
  }
  throw new Error('Input was supposed to result in an error.');
}
function getFileError(name, options){
  try {
    jade.renderFile(name, options);
  } catch (ex) {
    return ex;
  }
  throw new Error('Input was supposed to result in an error.');
}


describe('error reporting', function () {
  describe('compile time errors', function () {
    describe('with no filename', function () {
      it('includes detail of where the error was thrown', function () {
        var err = getError('foo(')
        assert(/Jade:1/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a filename', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getError('foo(', {filename: 'test.jade'})
        assert(/test\.jade:1/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a layout', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.layout.error.jade', {})
        assert(/layout.error.jade:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a include', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.include.error.jade', {})
        assert(/include.error.jade:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
  });
  describe('runtime errors', function () {
    describe('with no filename and `compileDebug` left undefined', function () {
      it('just reports the line number', function () {
        var sentinel = new Error('sentinel');
        var err = getError('-foo()', {foo: function () { throw sentinel; }})
        assert(/on line 1/.test(err.message))
      });
    });
    describe('with no filename and `compileDebug` set to `true`', function () {
      it('includes detail of where the error was thrown', function () {
        var sentinel = new Error('sentinel');
        var err = getError('-foo()', {foo: function () { throw sentinel; }, compileDebug: true})
        assert(/Jade:1/.test(err.message))
        assert(/-foo\(\)/.test(err.message))
      });
    });
    describe('with a filename that does not correspond to a real file and `compileDebug` left undefined', function () {
      it('just reports the line number', function () {
        var sentinel = new Error('sentinel');
        var err = getError('-foo()', {foo: function () { throw sentinel; }, filename: 'fake.jade'})
        assert(/on line 1/.test(err.message))
      });
    });
    describe('with a filename that corresponds to a real file and `compileDebug` left undefined', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var sentinel = new Error('sentinel');
        var path = __dirname + '/fixtures/runtime.error.jade'
        var err = getError(fs.readFileSync(path, 'utf8'), {foo: function () { throw sentinel; }, filename: path})
        assert(/fixtures\/runtime.error.jade:1/.test(err.message))
        assert(/-foo\(\)/.test(err.message))
      });
    });
    describe('in a mixin', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/runtime.with.mixin.error.jade', {})
        assert(/\/mixin.error.jade:2/.test(err.message))
        assert(/Cannot read property 'length' of null/.test(err.message))
      });
    });
  });
});
