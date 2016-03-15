
/**
 * Module dependencies.
 */

var uubench = require('uubench')
  , pug = require('../');


var suite = new uubench.Suite({
  min: 200,
  result: function(name, stats){
    var persec = 1000 / stats.elapsed
      , ops = stats.iterations * persec;
    console.log('%s: %d', name, ops | 0);
  }
});

function setup(self) {
  var suffix = self ? ' (self)' : ''
    , options = { self: self };

  var str = 'html\n  body\n    h1 Title'
    , fn = pug.compile(str, options);

  suite.bench('tiny' + suffix, function(next){
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

  var fn2 = pug.compile(str, options);

  suite.bench('small' + suffix, function(next){
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

  if (self) {
str = '\
html\n\
  body\n\
    h1 #{self.title}\n\
    ul#menu\n\
      - each link in self.links\r\n\
        li: a(href="#")= link\r\n\
';
  }

  var fn3 = pug.compile(str, options);

  suite.bench('small locals' + suffix, function(next){
    fn3({ title: 'Title', links: ['Home', 'About Us', 'Store', 'FAQ', 'Contact'] });
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

  str = Array(30).join(str);
  var fn4 = pug.compile(str, options);

  suite.bench('medium' + suffix, function(next){
    fn4();
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

  str = Array(100).join(str);
  var fn5 = pug.compile(str, options);

  suite.bench('large' + suffix, function(next){
    fn5();
    next();
  });
}

setup();
setup(true);

suite.run();