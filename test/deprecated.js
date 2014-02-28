'use strict';

var assert = require('assert');
var jade = require('../');

describe('deprecated functions', function () {
  function deprecate(name, fn) {
    it(name, function () {
      var consoleWarn = console.warn;
      var log = '';
      console.warn = function (msg) { log += msg; };
      fn();
      assert(new RegExp(name + ' is deprecated and will be removed in v2.0.0').test(log));
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
});