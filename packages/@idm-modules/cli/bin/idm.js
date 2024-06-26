#!/usr/bin/env node
'use strict'
const program = require('commander')

program.version(`@idm/cli ${require('../package').version}`).usage('<command> [options]')

// 打包zip文件
const zipCli = program.command('zip [packName]').option("-m, --main", 'auto generate main js').option("-ml, --mainLocal", 'auto generate main local js');
zipCli.description("auto zip dest bundle powered by idm-cli")
    .action((packName, options) => {
        require('../lib/zip')(packName, options)
    })

// 自动生成文档
const docCli = program.command('doc <className>');
docCli.description("auto generate a component's doc powered by idm-cli")
    .action((className, options) => {
        require('../lib/doc')(className, options)
    })

// 自动拉取模板
const createCli = program.command('create <project-name>')
createCli.description('create a new project powered by idm-cli')
    .action((projectName, options) => {
        require('../lib/create')(projectName, options)
    })


program.parse(process.argv)
