'use strict';

module.exports = filter;
function filter(name, str, options) {
  if (typeof filter[name] === 'function') {
    var res = filter[name](str, options);
  } else {
    throw new Error('unknown filter ":' + name + '"');
  }
  return res;
}
