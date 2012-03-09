
/**
 * Module dependencies.
 */

var uubench = require('uubench')
  , jade = require('../');


var suite = new uubench.Suite({
  min: 200,
  result: function(name, stats){
    var persec = 1000 / stats.elapsed
      , ops = stats.iterations * persec;
    console.log('%s: %d', name, ops | 0);
  }
});

var str = 'html\n  body\n    h1 Title'
  , fn = jade.compile(str);

suite.bench('tiny', function(next){
  fn();
  next();
});

str = '\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

var fn2 = jade.compile(str);

suite.bench('small', function(next){
  fn2();
  next();
});

str = '\
html\n\
  body\n\
    h1 #{title}\n\
    ul#menu\n\
      - each link in links\r\n\
        li: a(href="#")= link\r\n\
';

var fn3 = jade.compile(str);

suite.bench('small locals', function(next){
  fn3({ title: 'Title', links: ['Home', 'About Us', 'Store', 'FAQ', 'Contact'] });
  next();
});

suite.run();