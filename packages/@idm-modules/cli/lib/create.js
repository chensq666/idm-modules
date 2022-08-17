'use strict'
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const { scaffoldList, vueUI, reactUI } = require('./promptList')
const validateProjectName = require('validate-npm-package-name')
const resolve = (dirName) => path.resolve(__dirname, dirName)
module.exports = async (projectName, options) => {
    const cwd = options.cwd || process.cwd()
    const inCurrent = projectName === '.'
    const name = inCurrent ? path.relative('../', cwd) : projectName
    const targetDir = path.resolve(cwd, projectName || '.')

    const result = validateProjectName(name)
    if (!result.validForNewPackages) {
        console.error(chalk.red(`Invalid project name: "${name}"`))
        result.errors &&
            result.errors.forEach((err) => {
                console.error(chalk.red.dim('Error: ' + err))
            })
        result.warnings &&
            result.warnings.forEach((warn) => {
                console.error(chalk.red.dim('Warning: ' + warn))
            })
        process.exit(1)
    }

    if (fs.existsSync(targetDir)) {
        console.error(
            chalk.red(`Could not create project in ${chalk.bold(targetDir)} because the directory is exists.`)
        )
        process.exit(1)
    }

    const answer1 = await inquirer.prompt(scaffoldList)
    let promptUI = []
    if (answer1.scaffold === 'vue') {
        promptUI = vueUI
    } else if (answer1.scaffold === 'react') {
        promptUI = reactUI
    }
    const answer2 = await inquirer.prompt(promptUI)

    const templatePath = resolve(`../template/${answer1.scaffold}`)

    
}
