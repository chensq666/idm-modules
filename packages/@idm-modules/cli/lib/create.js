'use strict'
const IDMLog = require('../utils/console')
const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const inquirer = require('inquirer')
const { scaffoldList, vueUI, reactUI } = require('./promptList')
const validateProjectName = require('validate-npm-package-name')
const { addPlugin } = require('./addPlugin')
const download = require('download-git-repo')
const exec = require('child_process').exec
const ora = require('ora')
const { printParent } = require('./parten')
const templateUrl = {
    vue: 'direct:https://gitee.com/chensq666/idm-module-vue.git#main',
    react: 'direct:https://gitee.com/chensq666/idm-module-react.git'
}
module.exports = async (projectName, options) => {
    const cwd = options.cwd || process.cwd()
    const inCurrent = projectName === '.'
    const name = inCurrent ? path.relative('../', cwd) : projectName
    const targetDir = path.resolve(cwd, projectName || '.')

    const result = validateProjectName(name)
    if (!result.validForNewPackages) {
        IDMLog.error(`Invalid project name: "${name}"`)
        result.errors &&
            result.errors.forEach((err) => {
                IDMLog.error('Error: ' + err)
            })
        result.warnings &&
            result.warnings.forEach((warn) => {
                IDMLog.error('Warning: ' + warn)
            })
        process.exit(1)
    }

    if (fs.existsSync(targetDir)) {
        IDMLog.error(`Could not create project in ${chalk.bold(targetDir)} because the directory is exists.`)
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
    printParent()
    IDMLog.consoleY(`----> Start download idm's ${answer1.scaffold} scaffold template `)
    let spinner = ora('Downloading template ...').start();
    spinner.color = 'yellow';
	spinner.text = `Downloading ...`;
    spinner.start()
    download(templateUrl[answer1.scaffold], targetDir, { clone: true }, (err) => {
        if(err) {
            fs.unlinkSync(targetDir)
            console.log(err)
            process.exit(1)
        }
        spinner.stop()
        IDMLog.consoleG('Template has download success !')
        const projectPackPath = path.resolve(targetDir + '/package.json')
        const jsonObj = require(projectPackPath)
        jsonObj.name = projectName
        if (answer2.ui !== 'none') {
            IDMLog.consoleY(`----> Start add ${answer2.ui} plugin `)
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
            IDMLog.consoleG(`Plugin add success !`)
        }
        const jsonConfigStr = JSON.stringify(jsonObj, null, 2) + os.EOL
        fs.writeFileSync(projectPackPath, jsonConfigStr)
        IDMLog.consoleY(`----> cnpm i`)
        spinner = ora('cnpm i ...').start();
        spinner.color = 'yellow';
        spinner.text = `cnpm i ...`;
        spinner.start()
        exec('cnpm i', {cwd: targetDir, encoding:'utf-8'}, (err, stdout, stderr) => {
            if(err) throw err
            spinner.stop()
            IDMLog.consoleG(`cnpm i complete`)
        });
    })
}
