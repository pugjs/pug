'use strict';

var jade = require('../../');

exports.compile = compile;
function compile(lang) {
  lang = lang.split(/\r?\n/g);
  var result = {};
  var key = '';
  var value = [];
  lang.forEach(function (line, lineNumber) {
    if (/^[a-z\-]+\:$/.test(line)) {
      if (key) {
        result[key] = jade.compile(value.join('\n').trim());
        value = [];
      }
      key = line.replace(/:$/, '');
    } else if (/^  /.test(line) && key) {
      value.push(line.replace(/^  /, ''));
    } else if (line.trim() === '') {
      if (key) value.push('');
    } else if (/^\#/.test(line)) {
      // lines starting with # are comments
    } else {
      throw new Error('Error on line ' + (lineNumber + 1));
    }
  });
  if (key) {
    result[key] = jade.compile(value.join('\n').trim());
  }
  return result;
}
