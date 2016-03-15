
/**
 * Module dependencies.
 */

var pug = require('../')
  , assert = require('assert')
  , fs = require('fs');

// Shortcut

function getError(str, options){
  try {
    pug.render(str, options);
  } catch (ex) {
    return ex;
  }
  throw new Error('Input was supposed to result in an error.');
}
function getFileError(name, options){
  try {
    pug.renderFile(name, options);
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
        assert(/Pug:1/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a filename', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getError('foo(', {filename: 'test.pug'})
        assert(/test\.pug:1/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a layout without block declaration (syntax)', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.layout.syntax.error.pug', {})
        assert(/[\\\/]layout.syntax.error.pug:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a layout without block declaration (locals)', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.layout.locals.error.pug', {})
        assert(/[\\\/]layout.locals.error.pug:2/.test(err.message))
        assert(/is not a function/.test(err.message))
      });
    });
    describe('with a include (syntax)', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.include.syntax.error.pug', {})
        assert(/[\\\/]include.syntax.error.pug:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a include (locals)', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.include.locals.error.pug', {})
        assert(/[\\\/]include.locals.error.pug:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a layout (without block) with an include (syntax)', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.layout.with.include.syntax.error.pug', {})
        assert(/[\\\/]include.syntax.error.pug:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('with a layout (without block) with an include (locals)', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/compile.with.layout.with.include.locals.error.pug', {})
        assert(/[\\\/]include.locals.error.pug:2/.test(err.message))
        assert(/foo\(/.test(err.message))
      });
    });
    describe('Unexpected character', function () {
      it('includes details of where the error was thrown', function () {
        var err = getError('ul?', {});
        assert(err.message.indexOf('unexpected text "?"') !== -1);
      });
    });
    describe('Include filtered', function () {
      it('includes details of where the error was thrown', function () {
        var err = getError('include:verbatim()!', {});
        assert(err.message.indexOf('unexpected text "!"') !== -1);
        var err = getError('include:verbatim ', {});
        assert(err.message.indexOf('missing path for include') !== -1);
      });
    });
    describe('mixin block followed by a lot of blank lines', function () {
      it('reports the correct line number', function () {
        var err = getError('mixin test\n    block\n\ndiv()Test');
        var line = /Pug\:(\d+)/.exec(err.message);
        assert(line, 'Line number must be included in error message');
        assert(line[1] === '4', 'The error should be reported on line 4, not line ' + line[1]);
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
        assert(/Pug:1/.test(err.message))
        assert(/-foo\(\)/.test(err.message))
      });
    });
    describe('with a filename that does not correspond to a real file and `compileDebug` left undefined', function () {
      it('just reports the line number', function () {
        var sentinel = new Error('sentinel');
        var err = getError('-foo()', {foo: function () { throw sentinel; }, filename: 'fake.pug'})
        assert(/on line 1/.test(err.message))
      });
    });
    describe('with a filename that corresponds to a real file and `compileDebug` left undefined', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var sentinel = new Error('sentinel');
        var path = __dirname + '/fixtures/runtime.error.pug'
        var err = getError(fs.readFileSync(path, 'utf8'), {foo: function () { throw sentinel; }, filename: path})
        assert(/fixtures[\\\/]runtime\.error\.pug:1/.test(err.message))
        assert(/-foo\(\)/.test(err.message))
      });
    });
    describe('in a mixin', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/runtime.with.mixin.error.pug', {})
        assert(/mixin.error.pug:2/.test(err.message))
        assert(/Cannot read property 'length' of null/.test(err.message))
      });
    });
    describe('in a layout', function () {
      it('includes detail of where the error was thrown including the filename', function () {
        var err = getFileError(__dirname + '/fixtures/runtime.layout.error.pug', {})
        assert(/layout.with.runtime.error.pug:3/.test(err.message))
        assert(/Cannot read property 'length' of undefined/.test(err.message))
      });
    });
  });
  describe('deprecated features', function () {
    it('warns about element-with-multiple-attributes', function () {
      var consoleWarn = console.warn;
      var log = '';
      console.warn = function (str) {
        log += str;
      };
      var res = pug.renderFile(__dirname + '/fixtures/element-with-multiple-attributes.pug');
      console.warn = consoleWarn;
      assert(/element-with-multiple-attributes.pug, line 1:/.test(log));
      assert(/You should not have pug tags with multiple attributes/.test(log));
      assert(res === '<div attr="val" foo="bar"></div>');
    });
  });
  describe('if you throw something that isn\'t an error', function () {
    it('just rethrows without modification', function () {
      var err = getError('- throw "foo"');
      assert(err === 'foo');
    });
  });
  describe('import without a filename for a basedir', function () {
    it('throws an error', function () {
      var err = getError('include foo.pug');
      assert(/the "filename" option is required to use/.test(err.message));
      var err = getError('include /foo.pug');
      assert(/the "basedir" option is required to use/.test(err.message));
    })
  });
});
