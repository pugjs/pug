'use strict';

var fs = require('fs');

console.log('This module can be used during development\n' +
            'to link the pug modules to your local development\n' +
            'copies rather than the versions downloaded from npm');

var modules = [
  'pug-lexer',
  'pug-loader',
  'pug-parser',
  'pug-runtime',
  'pug-filters',
  'pug-linker',
  'pug-code-gen'
];

modules.forEach(function (id) {
  var production, development;
  try {
    production = require.resolve(id);
    development = require.resolve('../' + id);
    console.log('Linking: ' + id);
  } catch (ex) {
    console.warn('Could not link: ' + id);
    return;
  }
  fs.writeFileSync(production,
                   'module.exports = require("' + development + '");');
});
