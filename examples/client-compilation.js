// Miniserver for client-compilation.pug

'use strict';

var PORT = 3000;

var express = require('express');
var pug = require('../');

var app = express();

app.set('view engine', 'pug');
app.engine('pug', pug.renderFile);
app.set('views', __dirname);

app.get('/', function (req, res, next) {
  res.render('client-compilation');
});
app.use('/pug.js', express.static(__dirname + '/../pug.js'));

app.listen(PORT);
console.log('Server started at http://127.0.0.1:' + PORT + '/');
