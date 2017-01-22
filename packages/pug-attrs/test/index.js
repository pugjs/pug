'use strict';

var assert = require('assert');
var utils = require('util');
var testit = require('testit');
var attrs = require('../');

var options;
function test(input, expected, locals) {
  var opts = options;
  locals = locals || {};
  locals.pug = locals.pug || require('pug-runtime');
  testit(utils.inspect(input).replace(/\n/g, '') + ' => ' + utils.inspect(expected), function () {
    var src = attrs(input, opts);
    var localKeys = Object.keys(locals).sort();
    var output = Function(localKeys.join(', '), 'return (' + src + ');').apply(null, localKeys.map(function (key) { return locals[key]; }));
    if (opts.format === 'html') {
      assert.strictEqual(output, expected);
    } else {
      assert.deepEqual(output, expected);
    }
  });
}
function withOptions(opts, fn) {
  testit('options: ' + utils.inspect(opts), function () {
    options = opts;
    fn();
  });
}

withOptions({terse: true, format: 'html', runtime: function (name) { return 'pug.' + name; }}, function () {
  test([], '');
  test([{name: 'foo', val: 'false', mustEscape: true}], '');
  test([{name: 'foo', val: 'true', mustEscape: true}], ' foo');
  test([{name: 'foo', val: false, mustEscape: true}], '');
  test([{name: 'foo', val: true, mustEscape: true}], ' foo');
  test([{name: 'foo', val: 'foo', mustEscape: true}], '', {foo: false});
  test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo', {foo: true});
  test([{name: 'foo', val: '"foo"', mustEscape: true}], ' foo="foo"');
  test([{name: 'foo', val: '"foo"', mustEscape: true}, {name: 'bar', val: '"bar"', mustEscape: true}], ' foo="foo" bar="bar"');
  test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo="fooo"', {foo: 'fooo'});
  test([{name: 'foo', val: 'foo', mustEscape: true}, {name: 'bar', val: 'bar', mustEscape: true}], ' foo="fooo" bar="baro"', {foo: 'fooo', bar: 'baro'});
  test([{name: 'style', val: '{color: "red"}', mustEscape: true}], ' style="color:red"');
  test([{name: 'style', val: '{color: color}', mustEscape: true}], ' style="color:red"', {color: 'red'});
  test([{name: 'class', val: '"foo"', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], ' class="foo bar baz"');
  test([{name: 'class', val: '{foo: foo}', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], ' class="foo bar baz"', {foo: true});
  test([{name: 'class', val: '{foo: foo}', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], ' class="bar baz"', {foo: false});
  test([{name: 'class', val: 'foo', mustEscape: true}, {name: 'class', val: '"<str>"', mustEscape: true}], ' class="&lt;foo&gt; &lt;str&gt;"', {foo: '<foo>'});
  test([{name: 'foo', val: '"foo"', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], ' class="bar baz" foo="foo"');
  test([{name: 'class', val: '["bar", "baz"]', mustEscape: true}, {name: 'foo', val: '"foo"', mustEscape: true}], ' class="bar baz" foo="foo"');
  test([{name: 'foo', val: '"<foo>"', mustEscape: false}], ' foo="<foo>"');
  test([{name: 'foo', val: '"<foo>"', mustEscape: true}], ' foo="&lt;foo&gt;"');
  test([{name: 'foo', val: 'foo', mustEscape: false}], ' foo="<foo>"', {foo: '<foo>'});
  test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo="&lt;foo&gt;"', {foo: '<foo>'});
});
withOptions({terse: false, format: 'html', runtime: function (name) { return 'pug.' + name; }}, function () {
  test([{name: 'foo', val: 'false', mustEscape: true}], '');
  test([{name: 'foo', val: 'true', mustEscape: true}], ' foo="foo"');
  test([{name: 'foo', val: false, mustEscape: true}], '');
  test([{name: 'foo', val: true, mustEscape: true}], ' foo="foo"');
  test([{name: 'foo', val: 'foo', mustEscape: true}], '', {foo: false});
  test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo="foo"', {foo: true});
});

withOptions({terse: true, format: 'object', runtime: function (name) { return 'pug.' + name; }}, function () {
  test([], {});
  test([{name: 'foo', val: 'false', mustEscape: true}], {foo: false});
  test([{name: 'foo', val: 'true', mustEscape: true}], {foo: true});
  test([{name: 'foo', val: false, mustEscape: true}], {foo: false});
  test([{name: 'foo', val: true, mustEscape: true}], {foo: true});
  test([{name: 'foo', val: 'foo', mustEscape: true}], {foo: false}, {foo: false});
  test([{name: 'foo', val: 'foo', mustEscape: true}], {foo: true}, {foo: true});
  test([{name: 'foo', val: '"foo"', mustEscape: true}], {foo: 'foo'});
  test([{name: 'foo', val: '"foo"', mustEscape: true}, {name: 'bar', val: '"bar"', mustEscape: true}], {foo: 'foo', bar: 'bar'});
  test([{name: 'foo', val: 'foo', mustEscape: true}], {foo: 'fooo'}, {foo: 'fooo'});
  test([{name: 'foo', val: 'foo', mustEscape: true}, {name: 'bar', val: 'bar', mustEscape: true}], {foo: 'fooo', bar: 'baro'}, {foo: 'fooo', bar: 'baro'});
  test([{name: 'style', val: '{color: "red"}', mustEscape: true}], {style: 'color:red'});
  test([{name: 'style', val: '{color: color}', mustEscape: true}], {style: 'color:red'}, {color: 'red'});
  test([{name: 'class', val: '"foo"', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], {'class': 'foo bar baz'});
  test([{name: 'class', val: '{foo: foo}', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], {'class': 'foo bar baz'}, {foo: true});
  test([{name: 'class', val: '{foo: foo}', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], {'class': 'bar baz'}, {foo: false});
  test([{name: 'class', val: 'foo', mustEscape: true}, {name: 'class', val: '"<str>"', mustEscape: true}], {'class': '&lt;foo&gt; &lt;str&gt;'}, {foo: '<foo>'});
  test([{name: 'foo', val: '"foo"', mustEscape: true}, {name: 'class', val: '["bar", "baz"]', mustEscape: true}], {'class': 'bar baz', foo: 'foo'});
  test([{name: 'class', val: '["bar", "baz"]', mustEscape: true}, {name: 'foo', val: '"foo"', mustEscape: true}], {'class': 'bar baz', foo: 'foo'});
  test([{name: 'foo', val: '"<foo>"', mustEscape: false}], {foo: "<foo>"});
  test([{name: 'foo', val: '"<foo>"', mustEscape: true}], {foo: "&lt;foo&gt;"});
  test([{name: 'foo', val: 'foo', mustEscape: false}], {foo: "<foo>"}, {foo: '<foo>'});
  test([{name: 'foo', val: 'foo', mustEscape: true}], {foo: "&lt;foo&gt;"}, {foo: '<foo>'});
});
withOptions({terse: false, format: 'object', runtime: function (name) { return 'pug.' + name; }}, function () {
  test([{name: 'foo', val: 'false', mustEscape: true}], {foo: false});
  test([{name: 'foo', val: 'true', mustEscape: true}], {foo: true});
  test([{name: 'foo', val: false, mustEscape: true}], {foo: false});
  test([{name: 'foo', val: true, mustEscape: true}], {foo: true});
  test([{name: 'foo', val: 'foo', mustEscape: true}], {foo: false}, {foo: false});
  test([{name: 'foo', val: 'foo', mustEscape: true}], {foo: true}, {foo: true});
});
