
/**
 * Module dependencies.
 */

var pug = require('../');

pug.renderFile(__dirname + '/layout.pug', { debug: true }, function(err, html){
    if (err) throw err;
    console.log(html);
});
