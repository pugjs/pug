'use strict';

var assert = require('assert');
var testit = require('testit');
var runtime = require('../');
var build = require('../build');
var wrap = require('../wrap');

function test(name, fn) {
  testit(name, function () {

    fn(runtime[name]);
    fn(Function('', build([name]) + ';return pug_' + name + ';')());
    fn(wrap('function t() {return pug.' + name + ';}', 't')())
  });
}

test('attr', function (attr) { // (key, val, escaped, terse)
  // Boolean Attributes
  assert(attr('key', true, true, true) === ' key');
  assert(attr('key', true, false, true) === ' key');
  assert(attr('key', true, true, false) === ' key="key"');
  assert(attr('key', true, false, false) === ' key="key"');
  assert(attr('key', false, true, true) === '');
  assert(attr('key', false, false, true) === '');
  assert(attr('key', false, true, false) === '');
  assert(attr('key', false, false, false) === '');
  assert(attr('key', null, true, true) === '');
  assert(attr('key', null, false, true) === '');
  assert(attr('key', null, true, false) === '');
  assert(attr('key', null, false, false) === '');
  assert(attr('key', undefined, true, true) === '');
  assert(attr('key', undefined, false, true) === '');
  assert(attr('key', undefined, true, false) === '');
  assert(attr('key', undefined, false, false) === '');

  // Date Attributes
  assert(attr('key', new Date('2014-12-28T16:46:06.962Z'), true, true) === ' key="2014-12-28T16:46:06.962Z"');
  assert(attr('key', new Date('2014-12-28T16:46:06.962Z'), false, true) === ' key="2014-12-28T16:46:06.962Z"');
  assert(attr('key', new Date('2014-12-28T16:46:06.962Z'), true, false) === ' key="2014-12-28T16:46:06.962Z"');
  assert(attr('key', new Date('2014-12-28T16:46:06.962Z'), false, false) === ' key="2014-12-28T16:46:06.962Z"');

  // Custom JSON Attributes
  assert(attr('key', {toJSON: function () { return 'bar'; }}, true, false) === ' key="bar"');
  assert(attr('key', {toJSON: function () { return {foo: 'bar'}; }}, true, false) === ' key="{&quot;foo&quot;:&quot;bar&quot;}"');

  // JSON Attributes
  assert(attr('key', {foo: 'bar'}, true, true) === ' key="{&quot;foo&quot;:&quot;bar&quot;}"');
  assert(attr('key', {foo: 'bar'}, false, true) === ' key=\'{"foo":"bar"}\'');
  assert(attr('key', {foo: 'don\'t'}, true, true) === ' key="{&quot;foo&quot;:&quot;don\'t&quot;}"');
  assert(attr('key', {foo: 'don\'t'}, false, true) === ' key=\'{"foo":"don&#39;t"}\'');

  // Number attributes
  assert(attr('key', 500, true, true) === ' key="500"');
  assert(attr('key', 500, false, true) === ' key="500"');
  assert(attr('key', 500, true, false) === ' key="500"');
  assert(attr('key', 500, false, false) === ' key="500"');

  // String attributes
  assert(attr('key', 'foo', true, true) === ' key="foo"');
  assert(attr('key', 'foo', false, true) === ' key="foo"');
  assert(attr('key', 'foo', true, false) === ' key="foo"');
  assert(attr('key', 'foo', false, false) === ' key="foo"');
  assert(attr('key', 'foo>bar', true, true) === ' key="foo&gt;bar"');
  assert(attr('key', 'foo>bar', false, true) === ' key="foo>bar"');
  assert(attr('key', 'foo>bar', true, false) === ' key="foo&gt;bar"');
  assert(attr('key', 'foo>bar', false, false) === ' key="foo>bar"');
});

test('attrs', function (attrs) { // (obj, terse)
  assert(attrs({foo: 'bar'}, true) === ' foo="bar"');
  assert(attrs({foo: 'bar'}, false) === ' foo="bar"');
  assert(attrs({foo: 'bar', hoo: 'boo'}, true) === ' foo="bar" hoo="boo"');
  assert(attrs({foo: 'bar', hoo: 'boo'}, false) === ' foo="bar" hoo="boo"');
  assert(attrs({foo: ''}, true) === ' foo=""');
  assert(attrs({foo: ''}, false) === ' foo=""');
  assert(attrs({class: ''}, true) === '');
  assert(attrs({class: ''}, false) === '');
  assert(attrs({class: ['foo', {bar: true}]}, true) === ' class="foo bar"');
  assert(attrs({class: ['foo', {bar: true}]}, false) === ' class="foo bar"');
  assert(attrs({class: ['foo', {bar: true}], foo: 'bar'}, true) === ' class="foo bar" foo="bar"');
  assert(attrs({foo: 'bar', class: ['foo', {bar: true}]}, false) === ' class="foo bar" foo="bar"');
  assert(attrs({style: 'foo: bar;'}, true) === ' style="foo: bar;"');
  assert(attrs({style: 'foo: bar;'}, false) === ' style="foo: bar;"');
  assert(attrs({style: {foo: 'bar'}}, true) === ' style="foo:bar;"');
  assert(attrs({style: {foo: 'bar'}}, false) === ' style="foo:bar;"');
});

test('classes', function (classes) {
  assert(classes(['foo', 'bar']) === 'foo bar');
  assert(classes([['foo', 'bar'], ['baz', 'bash']]) === 'foo bar baz bash');
  assert(classes([['foo', 'bar'], {baz: true, bash: false}]) === 'foo bar baz');
  assert(classes([['fo<o', 'bar'], {'ba>z': true, bash: false}], [true, false]) ===
         'fo&lt;o bar ba>z');
});

test('escape', function (escape) {
  assert(escape('foo') === 'foo');
  assert(escape(10) === 10);
  assert(escape('foo<bar') === 'foo&lt;bar');
  assert(escape('foo&<bar') === 'foo&amp;&lt;bar');
  assert(escape('foo&<>bar') === 'foo&amp;&lt;&gt;bar');
  assert(escape('foo&<>"bar') === 'foo&amp;&lt;&gt;&quot;bar');
  assert(escape('foo&<>"bar"') === 'foo&amp;&lt;&gt;&quot;bar&quot;');
});

test('merge', function (merge) {
  assert.deepEqual(merge({foo: 'bar'}, {baz: 'bash'}), {foo: 'bar', baz: 'bash'});
  assert.deepEqual(merge([{foo: 'bar'}, {baz: 'bash'}, {bing: 'bong'}]), {foo: 'bar', baz: 'bash', bing: 'bong'});
  assert.deepEqual(merge({class: 'bar'}, {class: 'bash'}), {class: ['bar', 'bash']});
  assert.deepEqual(merge({class: ['bar']}, {class: 'bash'}), {class: ['bar', 'bash']});
  assert.deepEqual(merge({class: 'bar'}, {class: ['bash']}), {class: ['bar', 'bash']});
  assert.deepEqual(merge({class: 'bar'}, {class: null}), {class: ['bar']});
  assert.deepEqual(merge({class: null}, {class: ['bar']}), {class: ['bar']});
  assert.deepEqual(merge({}, {class: ['bar']}), {class: ['bar']});
  assert.deepEqual(merge({class: ['bar']}, {}), {class: ['bar']});

  assert.deepEqual(merge({style: 'foo:bar'}, {style: 'baz:bash'}), {style: 'foo:bar;baz:bash;'});
  assert.deepEqual(merge({style: 'foo:bar;'}, {style: 'baz:bash'}), {style: 'foo:bar;baz:bash;'});
  assert.deepEqual(merge({style: {foo: 'bar'}}, {style: 'baz:bash'}), {style: 'foo:bar;baz:bash;'});
  assert.deepEqual(merge({style: {foo: 'bar'}}, {style: {baz: 'bash'}}), {style: 'foo:bar;baz:bash;'});
  assert.deepEqual(merge({style: 'foo:bar'}, {style: null}), {style: 'foo:bar;'});
  assert.deepEqual(merge({style: 'foo:bar;'}, {style: null}), {style: 'foo:bar;'});
  assert.deepEqual(merge({style: {foo: 'bar'}}, {style: null}), {style: 'foo:bar;'});
  assert.deepEqual(merge({style: null}, {style: 'baz:bash'}), {style: 'baz:bash;'});
  assert.deepEqual(merge({style: null}, {style: 'baz:bash'}), {style: 'baz:bash;'});
  assert.deepEqual(merge({style: null}, {style: 'baz:bash'}), {style: 'baz:bash;'});
  assert.deepEqual(merge({}, {style: 'baz:bash'}), {style: 'baz:bash;'});
  assert.deepEqual(merge({}, {style: 'baz:bash'}), {style: 'baz:bash;'});
  assert.deepEqual(merge({}, {style: 'baz:bash'}), {style: 'baz:bash;'});
});

test('style', function (style) {
  assert(style(null) === '');
  assert(style('') === '');
  assert(style('foo: bar') === 'foo: bar;');
  assert(style('foo: bar;') === 'foo: bar;');
  assert(style({foo: 'bar'}) === 'foo:bar;');
  assert(style({foo: 'bar', baz: 'bash'}) === 'foo:bar;baz:bash;');
});
