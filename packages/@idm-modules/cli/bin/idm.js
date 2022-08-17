#!/usr/bin/env node
'use strict'
const program = require('commander')

program.version(`@idm/cli ${require('../package').version}`).usage('<command> [options]')

program
    .command('create <project-name>')
    .description('create a new project powered by idm-cli')
    .action((name, options) => {
        require('../lib/create')(name, options)
    })

program.parse(process.argv)
