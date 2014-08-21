'use strict';

var path = require('path');
var fs = require('fs');
var marked = require('marked');
var express = require('express');
var less = require('less-file');
var browserify = require('browserify-middleware');
var CodeMirror = require('highlight-codemirror');
var highlightJade = require('jade-highlighter');
var jade = require('../');


var version = require('../package.json').version;
var app = express();

var filters = jade.filters;

CodeMirror.loadMode('xml');//dep of htmlmixed
CodeMirror.loadMode('htmlmixed');
CodeMirror.loadMode('javascript');
CodeMirror.loadMode('css');

filters.jadesrc = highlightJade
filters.htmlsrc = function (html) {
  return CodeMirror.highlight(html, {name: 'htmlmixed'});
};
filters.jssrc = function (js) {
  return CodeMirror.highlight(js, {name: 'javascript'});
};
filters.csssrc = function (css) {
  return CodeMirror.highlight(css, {name: 'css'});
};

app.engine('jade', jade.renderFile);
app.set('views', __dirname + '/views');

app.locals.doctypes = jade.doctypes;

app.use(function (req, res, next) {
  if (req.url.substr(0, version.length + 2) === '/' + version + '/') {
    req.url = req.url.substr(version.length + 1);
    res.locals.path = function (path) {
      return '/' + version + path;
    };
  } else if (/^\/\d+\.\d+\.\d+\//.test(req.url)) {
    res.send(404, 'This page only exists on the live website');
    return;
  } else {
    res.locals.path = function (path) {
      return path;
    };
  }
  next();
});

app.get('/', function (req, res, next) {
  res.render('home.jade');
});
app.get('/reference', function (req, res, next) {
  res.render('reference.jade', {section: 'reference'});
});
app.get('/reference/:name', function (req, res, next) {
  res.render('reference/' + req.params.name + '.jade', {
    section: 'reference',
    currentDocumentation: req.params.name
  });
});
app.get('/api', function (req, res, next) {
  res.render('api.jade', {section: 'api'});
});
app.get('/command-line', function (req, res, next) {
  res.render('command-line.jade', {section: 'command-line'});
});
app.get('/history', function (req, res, next) {
  var versionHeader = /(\d+\.\d+\.\d+) *\/ *\d\d\d\d\-\d\d\-\d\d\<\/h2\>/g;
  var versions = JSON.parse(fs.readFileSync(__dirname + '/versions.json', 'utf8'));
  if (versions.indexOf(version) === -1) {
    versions.push(version);
    fs.writeFileSync(__dirname + '/versions.json', JSON.stringify(versions, null, '  '));
  }
  var history = marked(fs.readFileSync(__dirname + '/../History.md', 'utf8'))
    .replace(/h1/g, 'h2')
    .replace(versionHeader, function (_, version) {
      if (versions.indexOf(version) !== -1) {
        return _ + '<p><a href="/' + version +
          '/reference" rel="nofollow">Documentation</a></p>';
      } else {
        return _;
      }
    });
  res.render('history.jade', {
    section: 'history',
    history: history
  });
});

app.get('/client.js', browserify(__dirname + '/client/index.js'));
app.use('/style', less(__dirname + '/style/index.less'));
app.use('/style', express.static(__dirname + '/style'));
app.use('/coverage', express.static(path.resolve(__dirname + '/../coverage/lcov-report')));

app.use(function (err, req, res, next) {
  var msg = err.stack || err.toString();
  console.error(msg);
  if (res.statusCode < 400) res.statusCode = 500;
  if (err.status) res.statusCode = err.status;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', Buffer.byteLength(msg));
  if ('HEAD' == req.method) return res.end();
  res.end(msg);
});

module.exports = app.listen(3000);
module.exports.version = version;
