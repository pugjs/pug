'use strict';

var path = require('path');
var fs = require('fs');
var md = require('markdown-it')();
var express = require('express');
var less = require('less-file');
var browserify = require('browserify-middleware');
var highlight = require('highlight-codemirror');
var highlightPug = require('pug-highlighter');
var pug = require('../');


var version = require('../package.json').version;
var app = express();

var filters = pug.filters;

highlight.loadMode('xml');//dep of htmlmixed
highlight.loadMode('htmlmixed');
highlight.loadMode('javascript');
highlight.loadMode('css');

filters.pugsrc = highlightPug
filters.htmlsrc = function (html) {
  return highlight(html, 'htmlmixed');
};
filters.jssrc = function (js) {
  return highlight(js, 'javascript');
};
filters.csssrc = function (css) {
  return highlight(css, 'css');
};
filters.highlight = function (src, opt) {
  highlight.loadMode(opt.mode);
  return highlight(src, opt.mode)
};

app.engine('pug', pug.renderFile);
app.set('views', __dirname + '/views');

app.locals.doctypes = require('doctypes');

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
  res.render('home.pug');
});
app.get('/reference', function (req, res, next) {
  res.render('reference.pug', {section: 'reference'});
});
app.get('/reference/:name', function (req, res, next) {
  res.render('reference/' + req.params.name + '.pug', {
    section: 'reference',
    currentDocumentation: req.params.name
  });
});
app.get('/api', function (req, res, next) {
  res.render('api.pug', {section: 'api'});
});
app.get('/command-line', function (req, res, next) {
  res.render('command-line.pug', {section: 'command-line'});
});
app.get('/history', function (req, res, next) {
  var versionHeader = /(\d+\.\d+\.\d+) *\/ *\d\d\d\d\-\d\d\-\d\d\<\/h2\>/g;
  var versions = JSON.parse(fs.readFileSync(__dirname + '/versions.json', 'utf8'));
  if (versions.indexOf(version) === -1) {
    versions.push(version);
    fs.writeFileSync(__dirname + '/versions.json', JSON.stringify(versions, null, '  '));
  }
  var history = md.render(fs.readFileSync(__dirname + '/../History.md', 'utf8'))
    .replace(/h1/g, 'h2')
    .replace(versionHeader, function (_, version) {
      if (versions.indexOf(version) !== -1) {
        return _ + '<p><a href="/' + version +
          '/reference" rel="nofollow">Documentation</a></p>';
      } else {
        return _;
      }
    });
  res.render('history.pug', {
    section: 'history',
    history: history
  });
});

app.get('/client.js', browserify(__dirname + '/client/index.js'));
app.use('/style', less(__dirname + '/style/index.less'));
app.use('/style', express.static(__dirname + '/style'));

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
