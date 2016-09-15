'use strict';

var assert = require('assert');
var util = require('util');
var pug = require('../');

function deprecate(name, fn, regex) {
  it(name, function () {
    var consoleError = console.error;
    var consoleWarn = console.warn;
    var log = '';
    console.warn = function (msg) { log += msg; };
    console.error = function (msg) { log += msg; };
    try {
      fn();
      regex = regex || new RegExp(name + ' is deprecated and will be removed in v2.0.0');
      assert(regex.test(log), 'Expected ' + JSON.stringify(log) + ' to match ' + util.inspect(regex));
    } catch (ex) {
      console.error = consoleError;
      console.warn = consoleWarn;
      throw ex;
    }
    console.error = consoleError;
    console.warn = consoleWarn;
  });
}
describe('deprecated functions', function () {
  deprecate('tag.clone', function () {
    var tag = new pug.nodes.Tag();
    tag.clone();
  });
  deprecate('node.clone', function () {
    var code = new pug.nodes.Code('var x = 10');
    code.clone();
  });
  deprecate('block.clone', function () {
    var block = new pug.nodes.Block(new pug.nodes.Code('var x = 10'));
    block.clone();
  });
  deprecate('block.replace', function () {
    var block = new pug.nodes.Block(new pug.nodes.Code('var x = 10'));
    block.replace({});
  });
  deprecate('attrs.removeAttribute', function () {
    var tag = new pug.nodes.Tag('a');
    tag.setAttribute('foo', 'value');
    tag.removeAttribute('href');
    assert(!tag.getAttribute('href'));
    tag.setAttribute('href', 'value');
    tag.removeAttribute('href');
    assert(!tag.getAttribute('href'));
  });
  deprecate('attrs.getAttribute', function () {
    var tag = new pug.nodes.Tag('a');
    tag.setAttribute('href', 'value');
    assert(tag.getAttribute('href') === 'value');
  });
});

describe('deprecated options or local names', function () {
  deprecate('pug.compile(str, {client: true})', function () {
    var fn = pug.compile('div', {client: true});
    var fn = Function('pug', fn.toString() + '\nreturn template;')(pug.runtime);
    assert(fn() === '<div></div>');
  }, /The `client` option is deprecated/);
  deprecate('pug.render(str, {lexer: \'this is a local\'})', function () {
    var str = pug.render('div', {lexer: 'this is a local'});
    assert(str === '<div></div>');
  }, /Using `lexer` as a local in render\(\) is deprecated/);
});

describe('warnings that will become errors', function () {
  deprecate('block that is never actually used', function () {
    pug.renderFile(__dirname + '/fixtures/invalid-block-in-extends.jade');
  }, /Warning\: Unexpected block .* on line.*of.*This warning will be an error in v2\.0\.0/);
});