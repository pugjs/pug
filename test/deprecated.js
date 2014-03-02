'use strict';

var assert = require('assert');
var jade = require('../');

describe('deprecated functions', function () {
  function deprecate(name, fn, regex) {
    it(name, function () {
      var consoleError = console.error;
      var consoleWarn = console.warn;
      var log = '';
      console.warn = function (msg) { log += msg; };
      console.error = function (msg) { log += msg; };
      fn();
      assert((regex || new RegExp(name + ' is deprecated and will be removed in v2.0.0')).test(log));
      console.error = consoleError;
      console.warn = consoleWarn;
    });
  }
  deprecate('tag.clone', function () {
    var tag = new jade.nodes.Tag();
    tag.clone();
  });
  deprecate('node.clone', function () {
    var code = new jade.nodes.Code('var x = 10');
    code.clone();
  });
  deprecate('block.clone', function () {
    var block = new jade.nodes.Block(new jade.nodes.Code('var x = 10'));
    block.clone();
  });
  deprecate('block.replace', function () {
    var block = new jade.nodes.Block(new jade.nodes.Code('var x = 10'));
    block.replace({});
  });
  deprecate('attrs.removeAttribute', function () {
    var tag = new jade.nodes.Tag('a');
    tag.setAttribute('foo', 'value');
    tag.removeAttribute('href');
    assert(!tag.getAttribute('href'));
    tag.setAttribute('href', 'value');
    tag.removeAttribute('href');
    assert(!tag.getAttribute('href'));
  });
  deprecate('attrs.getAttribute', function () {
    var tag = new jade.nodes.Tag('a');
    tag.setAttribute('href', 'value');
    assert(tag.getAttribute('href') === 'value');
  });
  deprecate('jade.compile(str, {client: true})', function () {
    var fn = jade.compile('div', {client: true});
    var fn = Function('jade', fn.toString() + '\nreturn template;')(jade.runtime);
    assert(fn() === '<div></div>');
  }, /The `client` option is deprecated/);
});