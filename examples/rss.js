
/**
 * Module dependencies.
 */

var jade = require('./../')
  , path = __dirname + '/rss.jade'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = jade.compile(str, { filename: path, pretty: true });

var items = [];

items.push({ title: 'Example', description: 'Something', link: 'http://google.com' });
items.push({ title: 'LearnBoost', description: 'Cool', link: 'http://learnboost.com' });
items.push({ title: 'Express', description: 'Cool', link: 'http://expressjs.com' });

console.log(fn({ items: items }));