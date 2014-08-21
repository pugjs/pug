'use strict';

var GITHUB_CLIENT_ID = '2031dbe958e741775201';
var GITHUB_CLIENT_SECRET = 'd509a1e5e89248ce5d4211cb06995edcd979667d';
var SCOPE = 'public_repo';

var fs = require('fs');
var qs = require('querystring');
var crypto = require('crypto');
var express = require('express');
var opener = require('opener');
var github = require('github-basic');
var pr = require('pull-request');
var readdirp = require('lsr').sync;


// todo: check that the version is a new un-released version
// todo: check the user has commit access to the github repo
// todo: check the user is an owner in npm
// todo: check History.md has been updated

var version = require('./package.json').version;
var compiledWebsite = require('./docs/stop.js');

function getToken(gotToken) {
  try {
    var settings = JSON.parse(fs.readFileSync(__dirname + '/.release.json', 'utf8'));
    return gotToken(settings.token);
  } catch (ex) {
    // use server to initialize config
  }

  var app = express();

  var state = crypto.randomBytes(8).toString('hex');
  var server = null;

  app.get('/', function (req, res, next) {
    if (req.query.code) return next();
    res.redirect('https://github.com/login/oauth/authorize?client_id=' + GITHUB_CLIENT_ID
        + '&scope=' + SCOPE
        + '&redirect_uri=http://localhost:1337/'
        + '&state=' + state);
  });
  app.get('/', function (req, res, next) {
    var code = req.query.code;
    var u = 'https://github.com/login/oauth/access_token'
         + '?client_id=' + GITHUB_CLIENT_ID
         + '&client_secret=' + GITHUB_CLIENT_SECRET
         + '&code=' + code
         + '&state=' + state;
    github.buffer('GET', u, {}, {}, function (err, response) {
      if (err) return next(err);
      req.token = qs.parse(response.body);
      next();
    });
  });
  app.get('/', function (req, res, next) {
    res.send('got token, return to terminal');
    server.close();
    fs.writeFileSync(__dirname + '/.release.json', JSON.stringify({token: req.token}));
    gotToken(req.token);
  });

  server = app.listen(1337);
  server.setTimeout(3000);
  opener('http://localhost:1337');
}

getToken(function (token) {
  compiledWebsite.then(function () {
    var fileUpdates = readdirp(__dirname + '/docs/out').filter(function (info) {
      return info.isFile();
    }).map(function (info) {
      return {
        path: info.path.replace(/^\.\//, ''),
        content: fs.readFileSync(info.fullPath)
      };
    });
    return pr.commit('visionmedia', 'jade', {
      branch: 'gh-pages',
      message: 'Update website for ' + version,
      updates: fileUpdates
    }, {auth: {type: 'oauth', token: token.access_token}});
  }).then(function () {
    // todo: release the new npm package, set the tag and commit etc.
  }).done();
});
