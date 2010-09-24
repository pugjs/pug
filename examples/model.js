

/**
 * Module dependencies.
 */

var jade = require('./../lib/jade'),
    Compiler = jade.Compiler,
    nodes = jade.nodes;

var options = {
    pretty: true,
    locals: {
        user: {
            name: 'Tobi',
            email: 'vision-media.ca',
            summary: 'Tobi is a ferret, he is supes cool.',
            errors: { email: 'Invalid email' },
            new: false
        }
    }
};

jade.renderFile(__dirname + '/model.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});

// First define a filter named "model",
// which accepts a node (a Block node),
// and the parent Compiler

jade.filters.model = function(block, compiler){
    // pass the block / previous options to our new Visitor
    return new Visitor(block, compiler.options).compile();
};

function Visitor(node, options) {
    // "super" to the Compiler() constructor
    Compiler.call(this, node, options);
}

// Inherit from Compiler

Visitor.prototype.__proto__ = Compiler.prototype;

// Overwrite visitTag method 

Visitor.prototype.visitTag = function(node){
    var parent = Compiler.prototype.visitTag;
    switch (node.name) {
        case 'form':
            // Store the record variable name,
            // in our case "user"
            this.record = node.attrs[0].name;
            // remove the record name attribute
            node.removeAttribute(this.record);
            node.setAttribute('id', '"' + this.record + '-model-form"');
            node.setAttribute('method', '"post"');

            // when the record is not new, we probably want a _method hidden
            // field to tell our server to use PUT with frameworks like Express
            var code = new nodes.Code('if (!' + this.record + '.new)');
            var put = new nodes.Tag('input');
            put.setAttribute('type', '"hidden"');
            put.setAttribute('name', '"_method"');
            put.setAttribute('value', '"put"');
            code.block = new nodes.Block(put);
            node.block.push(code);

            parent.call(this, node);
            break;
        case 'field':
            var name = node.attrs[0].name,
                capitalized = name.charAt(0).toUpperCase() + name.slice(1);

            var label = new nodes.Tag('label');
            label.setAttribute('for', '"' + this.record + '[' + name + ']"');
            label.block.push(new nodes.Text(capitalized + ':'));
            parent.call(this, label);

            node = new nodes.Tag('input');
            node.setAttribute('type', '"text"');
            node.setAttribute('name', '"' + this.record + '[' + name + ']"');
            node.setAttribute('value', this.record + '.' + name);
            parent.call(this, node);

            var err = this.record + '.errors.' + name;
            node = new nodes.Code('if (' + err + ')');
            node.block = new nodes.Block;
            var p = new nodes.Tag('p', new nodes.Block(new nodes.Code(err, true, true)));
            node.block.push(p);
            Visitor.prototype.visitCode.call(this, node);
            break;
        case 'buttons':
            node = new nodes.Tag('input');
            node.setAttribute('type', '"submit"');
            node.setAttribute('value', this.record + '.new ? "Save" : "Update"');
            var p = new nodes.Tag('p', new nodes.Block(node));
            p.setAttribute('class', '"buttons"');
            parent.call(this, p);
            break;
        default:
            parent.call(this, node);
    }
};
