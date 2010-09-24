

/**
 * Module dependencies.
 */

var jade = require('./../lib/jade'),
    nodes = jade.nodes;

var options = {
    locals: {
        user: {
            name: 'tj',
            email: 'vision-media.ca',
            errors: { email: 'Invalid email' }
        }
    }
};

jade.renderFile(__dirname + '/model.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});

jade.filters.model = function(block, compiler){
    compiler.visit(block);
    console.log(block);
};