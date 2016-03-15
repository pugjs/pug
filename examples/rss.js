
/**
 * Module dependencies.
 */

var pug = require('../')
  , path = __dirname + '/rss.pug'
  , str = require('fs').readFileSync(path, 'utf8')
  , fn = pug.compile(str, { filename: path, pretty: true });

var items = [];

items.push({ title: 'Example', description: 'Something', link: 'http://google.com' });
items.push({ title: 'LearnBoost', description: 'Cool', link: 'http://learnboost.com' });
items.push({ title: 'Express', description: 'Cool', link: 'http://expressjs.com' });

console.log(fn({ items: items }));