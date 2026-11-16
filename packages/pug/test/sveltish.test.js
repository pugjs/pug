'use strict';

var assert = require('assert');
var pug = require('../');

function renderSveltish(src, data) {
  var options = Object.assign({}, data || {}, {sveltish: true});
  return pug.render(src, options);
}

describe('sveltish directives', function() {
  describe('class: directives', function() {
    it('adds the class when the condition is truthy', function() {
      assert.equal(
        renderSveltish('a.btn(class:active={cond}) x', {cond: true}),
        '<a class="btn active">x</a>'
      );
    });

    it('omits the class when the condition is falsy', function() {
      assert.equal(
        renderSveltish('a.btn(class:active={cond}) x', {cond: false}),
        '<a class="btn">x</a>'
      );
    });

    it('merges multiple class directives with a static class', function() {
      assert.equal(
        renderSveltish('a.btn(class:active={a})(class:primary={b}) x', {
          a: true,
          b: false,
        }),
        '<a class="btn active">x</a>'
      );
    });

    it('leaves class: attributes alone when the class directive is disabled', function() {
      assert.equal(
        pug.render('a(class:active={cond}) x', {
          cond: true,
          sveltish: {class: false},
        }),
        '<a class:active="{&quot;cond&quot;:true}">x</a>'
      );
    });
  });

  describe('bind: directives', function() {
    it('renders the evaluated expression as a plain attribute', function() {
      assert.equal(
        renderSveltish('input(bind:value={count})', {count: 7}),
        '<input value="7"/>'
      );
    });

    it('renders bind on custom attributes', function() {
      assert.equal(
        renderSveltish('div(bind:data-info={info}) x', {info: 'hi'}),
        '<div data-info="hi">x</div>'
      );
    });
  });

  describe('on: directives', function() {
    it('renders a data-on-* marker attribute with the handler source', function() {
      assert.equal(
        renderSveltish('button(on:click=save)', {}),
        '<button data-on-click="save"></button>'
      );
    });

    it('supports wrapped expression handlers with embedded quotes', function() {
      assert.equal(
        renderSveltish("button(on:click=(openDialog('hi')))", {}),
        '<button data-on-click="(openDialog(\'hi\'))"></button>'
      );
    });
  });

  describe('option handling', function() {
    it('does nothing when the sveltish option is absent', function() {
      assert.equal(
        pug.render('button(on:click=save)(class:a={x})', {x: true, save: 1}),
        '<button on:click="1" class:a="{&quot;x&quot;:true}"></button>'
      );
    });

    it('supports per-directive opt-out', function() {
      assert.equal(
        pug.render(
          'button(on:click=save)',
          {save: 1},
          {
            sveltish: {on: false},
          }
        ),
        '<button on:click="1"></button>'
      );
    });

    it('works inside mixins and conditionals', function() {
      assert.equal(
        renderSveltish(
          [
            'mixin row',
            '  tr(class:highlighted={hl})',
            '    td a',
            '    td b',
            '+row',
          ].join('\n'),
          {hl: true}
        ),
        '<tr class="highlighted"><td>a</td><td>b</td></tr>'
      );
      assert.equal(
        renderSveltish('if show\n  a.btn(class:active={cond}) x', {
          show: true,
          cond: true,
        }),
        '<a class="btn active">x</a>'
      );
    });
  });
});
