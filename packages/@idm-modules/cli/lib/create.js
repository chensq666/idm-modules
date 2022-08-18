'use strict'
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const inquirer = require('inquirer')
const { scaffoldList, vueUI, reactUI } = require('./promptList')
const validateProjectName = require('validate-npm-package-name')
const { addPlugin } = require('./addPlugin')
const download = require('download-git-repo')
const resolve = (dirName) => path.resolve(__dirname, dirName)
const ora = require('ora')
const templateUrl = {
    vue: 'github:yunit-code/idm-module-vue',
    react: 'github:web-csq/idm-module-react'
}
const consoleYellow = (text) => console.log(chalk.yellow(text))
const consoleGreen = (text) => console.log(chalk.green(text))
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

    fs.mkdirsSync(targetDir)
    consoleYellow(`----> Start download idm's ${answer1.scaffold} scaffold  template template `)
    const spinner = ora('Downloading template ...').start();
    spinner.color = 'yellow';
	spinner.text = `Downloading ...`;
    spinner.start()
    download(templateUrl[answer1.scaffold], targetDir, { clone: false }, (err) => {
        if(err) throw err
        spinner.stop()
        consoleGreen('Template has download success !')
        const projectPackPath = path.resolve(targetDir + '/package.json')
        const jsonObj = require(projectPackPath)
        jsonObj.name = projectName
        if (answer2.ui !== 'none') {
            consoleYellow(`----> Start add ${answer2.ui} plugin `)
            // 合并dependencies
            const uiPackage = require(`../frameworks/${answer2.ui}/package.json`)
            jsonObj.dependencies = { ...jsonObj.dependencies, ...uiPackage.dependencies }
            switch (answer2.ui) {
                case 'idm-react-antd':
                    jsonObj.babel['plugins'] = [
                        ['import', { libraryName: 'idm-react-antd', libraryDirectory: 'lib', style: 'css' }]
                    ]
            }
            addPlugin({
                targetDir,
                mainFileName: answer1.scaffold === 'vue' ? 'main.js': 'index.ts',
                pluginName: answer2.ui
            })
            consoleGreen(`Plugin add success !`)
        }
        const jsonConfigStr = JSON.stringify(jsonObj, null, 2) + os.EOL
        fs.writeFileSync(projectPackPath, jsonConfigStr)
    })
}
