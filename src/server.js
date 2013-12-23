'use strict'

var browserify = require('browserify-middleware');
var CodeMirror = require('highlight-codemirror');
var filters = require('jade').filters;
var jade = require('transform')('jade');
var express = require('express');
var app = express();

var marked = require('marked');

browserify.settings('basedir', require('path').resolve(__dirname, '../'));

marked.setOptions({
  highlight: function (code, lang) {
    if (!lang) return;
    lang = lang.toLowerCase();
    if (lang === 'js') lang = 'javascript';
    if (lang === 'html') lang = 'xml';
    return hljs.highlight(lang, code).value;
  }
})

CodeMirror.loadMode('xml');//dep of htmlmixed
CodeMirror.loadMode('htmlmixed');
CodeMirror.loadMode('javascript');

filters.jadesrc = require('jade-highlighter');
filters.htmlsrc = function (html) {
  return CodeMirror.highlight(html, {name: 'htmlmixed'});
};
filters.jssrc = function (js) {
  return CodeMirror.highlight(js, {name: 'javascript'});
};

app.use('/public', express.static(__dirname + '/public'));

app.get('/', jade('./pages/index.jade'));
app.get('/tutorial', jade('./pages/tutorial.jade'));
app.get('/api', jade('./pages/api.jade'));
app.get('/reference', jade('./pages/reference.jade', {doctypes: require('jade/lib/doctypes')}));
app.get('/command-line', jade('./pages/command-line.jade'));
app.get('/demo', jade('./pages/demo.jade'));
app.get('/client.js', browserify('./client/index.js'))

app.listen(3000);

if (!process.env.STOP) console.log('Server listening on localhost:3000')