#!/usr/bin/env node

try {
  require('jade-cli');
} catch (ex) {
  if (ex.code !== 'MODULE_NOT_FOUND') throw ex;
  console.error('The jade CLI is no longer part of the jade package.');
  console.error('You must now install it separately.');
  console.error('');
  console.error('  npm install jade-cli --global');
  console.error('');
  console.error('or');
  console.error('');
  console.error('  npm install jade-cli --save');
}
