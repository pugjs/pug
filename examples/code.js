
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var options = {
    locals: {
        users: {
            tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
            tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
        }
    }
};

jade.renderFile(__dirname + '/code.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});