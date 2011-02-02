

/**
 * Module dependencies.
 */

var jade = require('./../lib/jade'),
    Compiler = jade.Compiler,
    nodes = jade.nodes;

var options = {
    compiler: CSRF
  , locals: {
    csrf: 'WAHOOOOOO'
  }
};

jade.renderFile(__dirname + '/csrf.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});

function CSRF(node, options) {
  Compiler.call(this, node, options);
}

CSRF.prototype.__proto__ = Compiler.prototype;

CSRF.prototype.visitTag = function(node){
  var parent = Compiler.prototype.visitTag;
  switch (node.name) {
    case 'form':
      if ("'post'" == node.getAttribute('method')) {
        var tok = new nodes.Tag('input');
        tok.setAttribute('type', '"hidden"');
        tok.setAttribute('name', '"csrf"');
        tok.setAttribute('value', 'csrf');
        node.block.unshift(tok);
      }
  }
  parent.call(this, node);
};
