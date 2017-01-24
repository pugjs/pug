var fs = require('fs');
var assert = require('assert');
var pug = require('../');
var uglify = require('uglify-js');
var mkdirp = require('mkdirp').sync;

var filters = {
  custom: function (str, options) {
    assert(options.opt === 'val');
    assert(options.num === 2);
    return 'BEGIN' + str + 'END';
  }
};

// test cases

function writeFileSync(filename, data) {
  try {
    if (fs.readFileSync(filename, 'utf8') === data.toString('utf8')) {
      return;
    }
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
  }
  fs.writeFileSync(filename, data);
}

function findCases(dir) {
  return fs.readdirSync(dir).filter(function(file){
    return ~file.indexOf('.pug');
  }).map(function(file){
    return file.replace('.pug', '');
  });
}

function testSingle(it, suffix, test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = __dirname + '/cases' + suffix + '/' + test + '.pug';
    var str = fs.readFileSync(path, 'utf8');
    var fn = pug.compile(str, {
      filename: path,
      pretty: true,
      basedir: __dirname + '/cases' + suffix,
      filters: filters,
      filterAliases: {'markdown': 'markdown-it'},
    });
    var actual = fn({ title: 'Pug' });

    writeFileSync(__dirname + '/output' + suffix + '/' + test + '.html', actual);

    var html = fs.readFileSync(__dirname + '/cases' + suffix + '/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var clientCode = uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: false,
      basedir: __dirname + '/cases' + suffix,
      filters: filters,
      filterAliases: {'markdown': 'markdown-it'},
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    var clientCodeDebug = uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: true,
      basedir: __dirname + '/cases' + suffix,
      filters: filters,
      filterAliases: {'markdown': 'markdown-it'},
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    writeFileSync(__dirname + '/output' + suffix + '/' + test + '.js', uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: false,
      compileDebug: false,
      basedir: __dirname + '/cases' + suffix,
      filters: filters,
      filterAliases: {'markdown': 'markdown-it'},
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code);
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
      html = html.replace(/\n| /g, '');
    }
    if (/mixins-unused/.test(test)) {
      assert(/never-called/.test(str), 'never-called is in the pug file for mixins-unused');
      assert(!/never-called/.test(clientCode), 'never-called should be removed from the code');
    }
    expect(actual.trim()).toEqual(html);
    actual = Function('pug', clientCode + '\nreturn template;')()({ title: 'Pug' });
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
    }
    expect(actual.trim()).toEqual(html);
    actual = Function('pug', clientCodeDebug + '\nreturn template;')()({ title: 'Pug' });
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
    }
    expect(actual.trim()).toEqual(html);
  });
}


module.exports = {
  filters,
  findCases,
  testSingle,
};
