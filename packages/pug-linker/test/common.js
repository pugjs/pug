var assert = require('assert');

function replacer(key, value) {
  if (key === 'declaredBlocks') {
    return JSON.parse(JSON.stringify(value, function (k, v) {
      if (k === 'nodes') {
        return '<NODES>';
      }
      return v;
    }));
  }
  return value;
}

exports.prettyStringify = function prettyStringify (obj) {
  return JSON.stringify(obj, replacer, '  ');
}

// TODO: investigate if/how assert.deepEqual is buggy
exports.assertObjEqual = function assertObjEqual (a, b) {
  assert.equal(JSON.stringify(a, replacer), JSON.stringify(b, replacer));
}
