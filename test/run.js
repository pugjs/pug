
/**
 * Module dependencies.
 */

var jade = require('../')
  , fs = require('fs');

// test cases

describe("compiled templates", function(){
  var cases = fs.readdirSync('test/cases').filter(function(file){
    return ~file.indexOf('.jade');
  }).map(function(file){
    return file.replace('.jade', '');
  });

  cases.forEach(function(test){
    var name = test.replace(/[\-.]/g, ' ');
    it(name, function(){
      var path = 'test/cases/' + test + '.jade';
      var str = fs.readFileSync(path, 'utf8');
      var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
      var fn = jade.compile(str, { filename: path, pretty: true });
      var actual = fn({ title: 'Jade' });
      actual.trim().should.equal(html);
    });
  });
});

describe("error handling", function(){
  var cases = fs.readdirSync('test/errors').filter(function(file){
    return ~file.indexOf('.jade');
  }).map(function(file){
    return file.replace('.jade', '');
  });

  cases.forEach(function(test){
    var name = test.replace(/[\-.]/g, ' ');
    it(name, function(){
      var path = 'test/errors/' + test + '.jade';
      var str = fs.readFileSync(path, 'utf8');
      var expected = fs.readFileSync('test/errors/' + test + '.txt', 'utf8').trim().replace(/\r/g, '');
      try{
        var fn = jade.compile(str, { filename: path, pretty: true, debug: true });
        var result = fn({ title: 'Jade' });
      } catch(err){
        err.toString().trim().should.equal(expected);
      }
      throw new Error("render returned: " + result);
    });
  });
});