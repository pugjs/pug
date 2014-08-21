'use strict';

var transformers = require('transformers');

module.exports = filter;
function filter(name, str, options) {
  if (typeof filter[name] === 'function') {
    return filter[name](str, options);
  } else if (transformers[name]) {
    return transformers[name].renderSync(str, options);
  } else {
    throw new Error('unknown filter ":' + name + '"');
  }
}
