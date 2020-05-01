const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const prettierrc = require('../.prettierrc.js');
const prettierOptions = Object.assign(
  {
    trailingComma:
      /** @type {import('prettier').ParserOptions['trailingComma']} */ ('es5'),
  },
  prettierrc,
  prettierrc.overrides[0].options
);

// filename serializer that removes the basedir
module.exports = {
  test: function(val) {
    try {
      return (
        typeof val === 'string' &&
        /function /.test(val) &&
        val !== prettier.format(val, prettierOptions)
      );
    } catch (ex) {
      return false;
    }
  },
  print: function(val, serialize, indent) {
    return serialize(prettier.format(val, prettierOptions));
  }
};
