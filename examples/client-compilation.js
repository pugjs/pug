// Miniserver for client-compilation.jade

'use strict';

var PORT = 3000;

var express = require('express');
var jade = require('../');

var app = express();

app.set('view engine', 'jade');
app.engine('jade', jade.renderFile);
app.set('views', __dirname);

app.get('/', function (req, res, next) {
  res.render('client-compilation');
});
app.use('/jade.js', express.static(__dirname + '/../jade.js'));

app.listen(PORT);
console.log('Server started at http://127.0.0.1:' + PORT + '/');
