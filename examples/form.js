
/**
 * Module dependencies.
 */

var jade = require('./../lib/jade');

var options = {
    locals: {
        user: {
            name: 'TJ',
            email: 'tj@vision-media.ca',
            city: 'Victoria',
            province: 'BC'
        }
    }
};

jade.renderFile(__dirname + '/form.jade', options, function(err, html){
    if (err) throw err;
    console.log(html);
});