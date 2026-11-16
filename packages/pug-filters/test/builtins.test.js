'use strict';

var assert = require('assert');
var builtins = require('../lib/builtins');

describe('built-in filters', function() {
  describe('json', function() {
    it('serializes evaluated expressions', function() {
      assert.equal(
        builtins.json('{ foo: "bar", n: 1 }'),
        '{"foo":"bar","n":1}'
      );
      assert.equal(builtins.json('[1, 2, 3]'), '[1,2,3]');
      assert.equal(builtins.json('"text"'), '"text"');
    });

    it('applies the indent option', function() {
      assert.equal(builtins.json('{ a: 1 }', {indent: 2}), '{\n  "a": 1\n}');
    });

    it('throws a pug error on invalid expressions', function() {
      assert.throws(
        function() {
          builtins.json('not a js expression');
        },
        function(ex) {
          return ex.code === 'PUG:BUILTIN_FILTER_EVAL';
        }
      );
    });
  });

  describe('xml', function() {
    it('serializes objects to nested elements', function() {
      assert.equal(
        builtins.xml('{ user: { name: "a" } }'),
        '<root>\n  <user>\n    <name>a</name>\n  </user>\n</root>'
      );
    });

    it('serializes arrays to repeated item elements', function() {
      assert.equal(
        builtins.xml('[1, 2]'),
        '<root>\n  <item>1</item>\n  <item>2</item>\n</root>'
      );
    });

    it('escapes text and uses self-closing tags for null values', function() {
      assert.equal(
        builtins.xml(
          "{ name: \"O'Brien\", tags: ['a<b', 'c&d'], score: null }"
        ),
        [
          '<root>',
          '  <name>O&apos;Brien</name>',
          '  <tags>',
          '    <item>a&lt;b</item>',
          '    <item>c&amp;d</item>',
          '  </tags>',
          '  <score />',
          '</root>',
        ].join('\n')
      );
    });

    it('honors root and attrs options', function() {
      assert.equal(
        builtins.xml('5', {root: 'n', attrs: {type: 'int', on: true}}),
        '<n type="int" on>5</n>'
      );
      assert.equal(builtins.xml('null', {root: 'n'}), '<n />');
    });
  });
});
