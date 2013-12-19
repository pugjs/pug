'use strict';

var transformers = require('transformers');

module.exports = filter;
function filter(name, str, options) {
  if (typeof filter[name] === 'function') {
    var res = filter[name](str, options);
  } else if (transformers[name]) {
    var res = transformers[name].renderSync(str, options);
  } else {
    throw new Error('unknown filter ":' + name + '"');
  }
  return res;
}
filter.exists = function (name, str, options) {
  return typeof filter[name] === 'function' || transformers[name];
};
