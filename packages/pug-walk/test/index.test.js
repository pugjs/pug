'use strict';

var assert = require('assert');
var lex = require('pug-lexer');
var parse = require('pug-parser');
var walk = require('../');

test('simple', function() {
  var ast = walk(
    parse(lex('.my-class foo')),
    function before(node, replace) {
      // called before walking the children of `node`
      // to replace the node, call `replace(newNode)`
      // return `false` to skip descending
      if (node.type === 'Text') {
        replace({
          type: 'Text',
          val: 'bar',
          line: node.line,
          column: node.column
        });
      }
    },
    function after(node, replace) {
      // called before walking the children of `node`
      // to replace the node, call `replace(newNode)`
    }
  );
  expect(ast).toEqual(parse(lex('.my-class bar')));
});

describe('replace([])', function() {
  test('block flattening', function() {
    var called = [];
    var ast = walk(
      {
        type: 'Block',
        nodes: [
          {
            type: 'Block',
            nodes: [
              {
                type: 'Block',
                nodes: [
                  {
                    type: 'Text',
                    val: 'a'
                  },
                  {
                    type: 'Text',
                    val: 'b'
                  }
                ]
              },
              {
                type: 'Text',
                val: 'c'
              }
            ]
          },
          {
            type: 'Text',
            val: 'd'
          }
        ]
      },
      function(node, replace) {
        if (node.type === 'Text') {
          called.push('before ' + node.val);
          if (node.val === 'a') {
            assert(replace.arrayAllowed, 'replace.arrayAllowed set wrongly');
            replace([
              {
                type: 'Text',
                val: 'e'
              },
              {
                type: 'Text',
                val: 'f'
              }
            ]);
          }
        }
      },
      function(node, replace) {
        if (node.type === 'Block' && replace.arrayAllowed) {
          replace(node.nodes);
        } else if (node.type === 'Text') {
          called.push('after ' + node.val);
        }
      }
    );

    expect(ast).toEqual({
      type: 'Block',
      nodes: [
        { type: 'Text', val: 'e' },
        { type: 'Text', val: 'f' },
        { type: 'Text', val: 'b' },
        { type: 'Text', val: 'c' },
        { type: 'Text', val: 'd' }
      ]
    });

    assert.deepEqual(
      called,
      [
        'before a',

        'before e',
        'after e',

        'before f',
        'after f',

        'before b',
        'after b',

        'before c',
        'after c',

        'before d',
        'after d'
      ],
      'before() and after() called incorrectly: ' + JSON.stringify(called)
    );
  });

  test('adding include filters', function() {
    var ast = walk(parse(lex('include:filter1:filter2 file')), function(
      node,
      replace
    ) {
      if (node.type === 'IncludeFilter') {
        assert(replace.arrayAllowed);
        if (node.name === 'filter1') {
          var firstFilter = 'filter3';

          replace([
            {
              type: 'IncludeFilter',
              name: firstFilter,
              attrs: [],
              line: node.line,
              column: node.column
            },
            {
              type: 'IncludeFilter',
              name: 'filter4',
              attrs: [],
              line: node.line,
              column: node.column + firstFilter.length + 1
            }
          ]);
        } else if (node.name === 'filter2') {
          replace([]);
        }
      }
    });

    expect(ast).toEqual(parse(lex('include:filter3:filter4 file')));
  });

  test('fails when parent is not Block', function() {
    walk(parse(lex('p content')), function(node, replace) {
      if (
        node.type === 'Block' &&
        node.nodes[0] &&
        node.nodes[0].type === 'Text'
      ) {
        assert(!replace.arrayAllowed, 'replace.arrayAllowed set wrongly');
        assert.throws(function() {
          replace([]);
        });
      }
    });
  });
});
