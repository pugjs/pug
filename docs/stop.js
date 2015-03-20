'use strict';

var url = require('url');
var stop = require('stop');
var rimraf = require('rimraf').sync;

var server = require('./server.js');
var version = require('../package.json').version;

rimraf(__dirname + '/out');

module.exports = stop.getWebsiteStream('http://localhost:3000', {
  filter: function (currentURL) {
    var u = url.parse(currentURL);
    return u.hostname === 'localhost' &&
      (!/^\/\d+\.\d+\.\d+\//.test(u.pathname) ||
       u.pathname.substr(0, version.length + 2) === '/' + version + '/');
  },
  parallel: 1
})
.on('data', function (page) {
  if (page.statusCode !== 200) {
    throw new Error('Unexpected status code ' + page.statusCode +
                    ' for ' + page.url);
  }
  console.log(page.statusCode + ' - ' + page.url);
})
.syphon(stop.writeFileSystem(__dirname + '/out'))
.wait().then(function () {
  server.close();
  console.log('successfuly compiled website');
});
