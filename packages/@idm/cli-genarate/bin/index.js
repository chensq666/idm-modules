#!/usr/bin/env node
'use strict';

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 14) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'IDM-CLI requires Node 14 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

const rawArgv = process.argv.slice(2)

const { init } = require('../lib/genarate');

init(rawArgv[0]);