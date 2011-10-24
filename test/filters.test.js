
/**
 * Module dependencies.
 */

var jade = require('../')
  , assert = require('assert')
  , Compiler = jade.Compiler
  , nodes = jade.nodes;

// Shortcut

var render = function(str, options){
  var fn = jade.compile(str, options);
  return fn(options);
};

jade.filters.conditionals = function(block, compiler){
    return new Visitor(block).compile();
};

function Visitor(node) {
    this.node = node;
}

Visitor.prototype.__proto__ = Compiler.prototype;

Visitor.prototype.visit = function(node){
  this.visitNode(node);
};

Visitor.prototype.visitTag = function(node){
  switch (node.name) {
    case 'or':
      var block = node.block;
      node = new nodes.Code('else');
      node.block = block;
      node.instrumentLineNumber = false;
      this.visit(node);
      break;
    default:
      Compiler.prototype.visitTag.call(this, node);
  }
};

module.exports = {
  'test :cdata filter': function(){
    assert.equal('<![CDATA[\nfoo\n]]>', render(':cdata\n  foo'));
    assert.equal('<![CDATA[\nfoo\nbar\n]]>', render(':cdata\n  foo\n  bar'));
    assert.equal('<![CDATA[\nfoo\nbar\n]]><p>something else</p>', render(':cdata\n  foo\n  bar\np something else'));
  },
  
  'test :markdown filter': function(){
      assert.equal(
          '<h1>foo</h1>\n\n<ul><li>bar</li><li>baz</li></ul>',
          render(':markdown\n  #foo\n  - bar\n  - baz\n'))
  },
  
  'test :stylus filter': function(){
      assert.equal(
          '<style type="text/css">body {\n  color: #c00;\n}\n</style>',
          render(':stylus\n  body\n    color #c00'));
  },
  
  'test :stylus filter with options': function(){
      assert.equal(
          '<style type="text/css">body{color:#c00}\n</style>',
          render(':stylus(compress=true)\n  body\n    color #c00'));
  },
  
  'test :less filter': function(){
      assert.equal(
          '<style type="text/css">.class {\n  width: 20px;\n}\n</style>',
          render(':less\n  .class { width: 10px * 2 }\n'));
  },
  
  'test :coffeescript filter': function(){
      var coffee, js;
      coffee = [
          ':coffeescript',
          '  square = (x) ->',
          '    x * x'
      ].join('\n');
      js = [
          '<script type="text/javascript">',
          '(function() {',
          '  var square;',
          '  square = function(x) {',
          '    return x * x;',
          '  };',
          '}).call(this);',
          '</script>'
      ].join('\n');
  
      assert.equal(js, render(coffee));
  
      coffee = [
          ':coffeescript',
          '  $ ->',
          '    $("#flash").fadeIn ->',
          '      console.log("first line")',
          '      console.log("second line")'
      ].join('\n');
      js = [
          '<script type="text/javascript">',
          '(function() {',
          '  $(function() {',
          '    return $("#flash").fadeIn(function() {',
          '      console.log("first line");',
          '      return console.log("second line");',
          '    });',
          '  });',
          '}).call(this);',
          '</script>'
      ].join('\n');
  
      assert.equal(js, render(coffee));
  },
  
  'test parse tree': function(){
      var str = [
          'conditionals:',
          '  if false',
          '    | oh noes',
          '  or',
          '    if null == false',
          '      p doh',
          '    or',
          '      p amazing!'
      ].join('\n');
  
      var html = [
          '<p>amazing!</p>'
      ].join('');
  
      assert.equal(html, render(str));
  },
  
  'test filter attrs': function(){
     jade.filters.testing = function(str, attrs){
       return str + ' ' + attrs.stuff;
     };
  
     var str = [
         ':testing(stuff)',
         '  foo bar',
     ].join('\n');
  
     assert.equal('foo bar true', render(str));
  } 
};