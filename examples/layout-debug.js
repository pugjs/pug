
/**
 * Module dependencies.
 */

var jade = require('../');

jade.renderFile(__dirname + '/layout.jade', { debug: true }, function(err, html){
    if (err) throw err;
    console.log(html);
});
