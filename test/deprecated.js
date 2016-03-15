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

describe('warnings that will become errors', function () {
  deprecate('block that is never actually used', function () {
    pug.renderFile(__dirname + '/fixtures/invalid-block-in-extends.pug');
  }, /Warning\: Unexpected block .* on line.*of.*This warning will be an error in v2\.0\.0/);
});