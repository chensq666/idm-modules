'use strict'

const chalk = require('chalk')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const os = require('os')
const contextPath = process.cwd()
const resolve = (...file) => path.resolve(contextPath, ...file)
const log = (message) => console.log(chalk.green(`${message}`))
const successLog = (message) => console.log(chalk.blue(`${message}`))
const errorLog = (error) => console.log(chalk.red(`${error}`))
const dayjs = require('dayjs')
const jsonPath = resolve('./public/static/config.json')
const { reactTemplate, vueTemplate, jsonTemplate, configItem } = require('../lib/template')

let jsonObj = null
try {
    jsonObj = require(jsonPath)
} catch (error) {
    errorLog(error.message)
    process.exit(0)
}

let componentFile, jsonFile

const generateFile = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf8', (err) => {
            if (err) {
                errorLog(err.message)
                reject(err)
            } else {
                resolve(true)
            }
        })
    })
}

const ComTypeMap = {
    vue: {
        ext: 'vue',
        template: vueTemplate
    },
    react: {
        ext: 'tsx',
        template: reactTemplate
    }
}

async function init(comLangue) {
    const currentComType = ComTypeMap[comLangue || 'vue']
    const promptList = [
        {
            type: 'input',
            name: 'className',
            message: `Please enter the IDM component's className to be generated, like IText`,
            validate(className) {
                var done = this.async()
                setTimeout(function () {
                    if (!className) {
                        // Pass the return value in the done callback
                        done('You need to enter className')
                        return
                    }
                    // 组件代码文件
                    componentFile = resolve(`./src/components/${className}.${currentComType.ext}`)
                    // json文件
                    jsonFile = resolve(`./public/static/attributes/${className}.json`)
                    // 组件代码文件是否存在
                    let fileExists = fs.existsSync(componentFile)
                    if (fileExists) {
                        done(`${className} component file already exists, please re-enter`)
                        return
                    }
                    // 配置json是否存在
                    fileExists = fs.existsSync(jsonFile)
                    if (fileExists) {
                        done(`${className} json already exists, please re-enter`)
                        return
                    }
                    // static/config.json内是否已经配置
                    const configIndex = jsonObj.module.findIndex(el => el.className === className)
                    if (configIndex > -1) {
                        done('static/config.json already exists, please re-enter')
                        return
                    }

                    done(null, true)
                }, 100)
            }
        },
        {
            type: 'input',
            name: 'comName',
            message: `Please enter the IDM component's comName to be generated, like 文本`,
            validate(comName) {
                var done = this.async()
                setTimeout(function () {
                    if (!comName) {
                        // Pass the return value in the done callback
                        done('You need to enter comName')
                        return
                    }
                    done(null, true)
                }, 100)
            }
        },
        {
            type: 'list',
            name: 'comType',
            message: `Please choose the IDM component's comType`,
            default: 'common',
            choices: ['common', 'dialog']
        }
    ]

    const answers = await inquirer.prompt(promptList)
    for (const key in answers) {
        if (Object.hasOwnProperty.call(answers, key)) {
            answers[key] = answers[key].trim()
        }
    }
    const { className, comName } = answers

    try {
        const packageName = jsonObj.className
        log(`Generating component file ${componentFile}`)
        await generateFile(componentFile, currentComType.template(className))
        log(`Generating json file ${jsonFile}`)
        await generateFile(jsonFile, jsonTemplate({ ...answers, packageName, comLangue }))
        const configItemObj = configItem({ ...answers, packageName, comLangue })
        jsonObj.module.push(configItemObj)
        jsonObj.lasttime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const jsonConfigStr = JSON.stringify(jsonObj, null, 2) + os.EOL
        log(`Adding ${jsonPath}`)
        await generateFile(jsonPath, jsonConfigStr, false)
        successLog(`${className}/${comName} component generated success`)
    } catch (e) {
        errorLog(e.message)
    }
}

module.exports = {
    init
}
