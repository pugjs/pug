

/**
 * Module dependencies.
 */

var jade = require('./../lib/jade'),
    Compiler = jade.Compiler,
    nodes = jade.nodes;

var options = {
    locals: {
        user: {
            name: 'tj',
            email: 'vision-media.ca',
            errors: { email: 'Invalid email' },
            new: true
        }
    }
};

jade.renderFile(__dirname + '/model.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});

jade.filters.model = function(block, compiler){
    return new Visitor(block).compile();
};

function Visitor(node) {
    this.node = node;
}

Visitor.prototype.__proto__ = Compiler.prototype;

Visitor.prototype.visitTag = function(node){
    var parent = Compiler.prototype.visitTag;
    switch (node.name) {
        case 'form':
            this.record = node.attrs[0].name;
            node = new nodes.Tag('form');
            node.addAttribute('id', '"' + this.record + '-model-form"');
            node.addAttribute('method', '"post"');
            parent.call(this, node);
            break;
        case 'field':
            var name = node.attrs[0].name,
                capitalized = name.charAt(0).toUpperCase() + name.slice(1);

            var label = new nodes.Tag('label');
            label.addAttribute('for', '"' + this.record + '[' + name + ']"');
            label.block = new nodes.Block;
            label.block.push(new nodes.Text(capitalized + ':'));
            parent.call(this, label);

            node = new nodes.Tag('input');
            node.addAttribute('type', '"text"');
            node.addAttribute('name', '"' + this.record + '[' + name + ']"');
            node.addAttribute('value', this.record + '.' + name);
            parent.call(this, node);

            var err = this.record + '.errors.' + name;
            node = new nodes.Code('if (' + err + ')', false, false);
            node.block = new nodes.Block;
            var p = new nodes.Tag('p');
            p.block = new nodes.Block;
            p.block.push(new nodes.Code(err, true, true));
            node.block.push(p);
            Visitor.prototype.visitCode.call(this, node);
            break;
        case 'buttons':
            node = new nodes.Tag('input');
            node.addAttribute('type', '"submit"');
            node.addAttribute('value', this.record + '.new ? "Save" : "Update"');
            var p = new nodes.Tag('p');
            p.addAttribute('class', '"buttons"');
            p.block.push(node);
            parent.call(this, p);
            break;
        default:
            parent.call(this, node);
    }
};
