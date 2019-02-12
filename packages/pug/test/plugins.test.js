
'use strict';

var assert = require('assert');
var pug = require('../');

describe('plugins', function(){
  it('should support codegen plugin', function(){
    var fn = pug.compile('p foo', {
      plugins: [{
        codeGen () {
          return 'function template() {\nreturn \'hello world\'\n}';
        }
      }]
    });
    assert.equal('hello world', fn());
  });

  it('should throw on duplicate codegen plugin', function(){
    try {
      pug.compile('p foo', {
        plugins: [{
          codeGen () {
            return 'function template() {\nreturn \'hello world\'\n}';
          }
        },
        {
          codeGen () {
            return 'function template() {\nreturn \'booom\'\n}';
          }
        }]
      });
    } catch (error) {
      assert.ok(error);
    }
  });
});