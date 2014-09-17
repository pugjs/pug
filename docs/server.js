'use strict';

var path = require('path');
var fs = require('fs');
var marked = require('marked');
var express = require('express');
var less = require('less-file');
var browserify = require('browserify-middleware');
var CodeMirror = require('highlight-codemirror');
var highlightJade = require('jade-highlighter');
var languageParser = require('./lib/language-parser.js');
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

// using ISO 639-1 Language Codes
var languages = {};
fs.readdirSync(__dirname + '/languages').forEach(function (languageFile) {
  if (!/\.lang$/.test(languageFile)) return;
  languages[languageFile.replace(/\.lang$/, '')] = languageParser.compile(fs.readFileSync(__dirname + '/languages/' + languageFile, 'utf8'));
});

app.engine('jade', function (path, options, callback) {
  var html = jade.renderFile(path, options);
  var lang = (options.lang || 'en');
  var language = languages[lang];
  var defaultLanguage = languages['en'];
  html = html.replace(/((?: |\t)*)\{\{((?:[^\}]|\}[^\}])+)\}\}/g, function (_, space, expression) {
    var result = _;
    var match;
    if (/^[a-z\-]+$/.test(expression)) {
      if (!language[expression] && !defaultLanguage[expression]) {
        throw new Error('Could not find ' + expression + ' in ' + lang + ' or en (the default language)');
      }
      result = (language[expression] || defaultLanguage[expression])().replace(/^/gm, space);
    } else if (match = /^([a-z\-]+)\((.*)\)$/.exec(expression)) {
      if (!language[match[1]] && !defaultLanguage[match[1]]) {
        throw new Error('Could not find ' + match[1] + ' in ' + lang + ' or en (the default language)');
      }
      result = (language[match[1]] || defaultLanguage[match[1]]).apply(null, Function('', 'return [' + match[2] + ']')()).replace(/^/gm, space);
    }
    if (result !== _ && options.mask) {
      return result.replace(/\S/g, '-');
    }
    return result;
  });
  callback(null, html);
});
app.set('views', __dirname + '/views');

app.locals.doctypes = jade.doctypes;

app.use(function (req, res, next) {
  var lang = 'en';
  req.url = req.url.replace(/^\/([a-z][a-z])\//, function (_, languageCode) {
    if (languages[languageCode] && languageCode !== 'en') {
      lang = languageCode;
      return '/';
    }
    return _;
  });
  if (req.query.mask) {
    res.locals.mask = true;
  }
  res.locals.lang = lang;
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
  if (lang !== 'en') {
    var getPath = res.locals.path;
    var getLangPath = function (path, options) {
      options = options || {};
      if (options.lang === 'en') {
        if (options.version === 'latest') {
          return path;
        } else if (options.version) {
          return '/' + options.version + path;
        } else {
          return getPath(path);
        }
      } else if (options.lang) {
        if (options.verson === 'latest') {
          return '/' + options.lang + path;
        } else if (options.verson) {
          return '/' + options.lang + '/' + options.version + path;
        } else {
          return '/' + options.lang + getPath(path);
        }
      } else {
        if (options.version === 'latest') {
          return '/' + lang + path;
        } else if (options.version) {
          return '/' + lang + '/' + options.version + path;
        } else {
          return '/' + lang + getPath(path);
        }
      }
    };
    res.locals.path = function (path, options) {
      if (res.locals.mask) {
        return getLangPath(path, options) + '?mask=true';
      } else {
        return getLangPath(path, options);
      }
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

        return _ + '<p><a href="' + res.locals.path('/reference', {version: version, lang: 'en'}) + '" rel="nofollow">Documentation</a></p>';
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
