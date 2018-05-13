'use strict';

const fs = require('fs');
const assert = require('assert');
const mkdirp = require('mkdirp').sync;
const runUtils = require('./run-utils');
const pug = require('../');

var cases = runUtils.findCases(__dirname + '/cases');
var es2015 = runUtils.findCases(__dirname + '/cases-es2015');

mkdirp(__dirname + '/output-es2015');

describe('test cases for ECMAScript 2015', function () {
  try {
    eval('``');
    es2015.forEach(runUtils.testSingle.bind(null, it, '-es2015'));
  } catch (ex) {
    es2015.forEach(runUtils.testSingle.bind(null, it.skip, '-es2015'));
  }
});
