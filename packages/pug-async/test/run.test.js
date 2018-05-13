'use strict';

// even and odd tests are arbitrarily split because jest is faster that way

const fs = require('fs');
const assert = require('assert');
const mkdirp = require('mkdirp').sync;
const runUtils = require('./run-utils');
const pug = require('../');

var cases = runUtils.findCases(__dirname + '/cases');
var es2015 = runUtils.findCases(__dirname + '/cases-es2015');

mkdirp(__dirname + '/output');

describe('test cases', function () {
  cases.forEach((test, i) => {
    runUtils.testSingle(it, '', test);
  });
});
