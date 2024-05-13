const fs = require('fs')
const path = require('path')
const IDMLog = require('../utils/console')
const compressing = require('compressing')
const { cwdJoin, getFileObjectContent } = require('../utils/file')
const { timeFormat } = require('../utils/date')
const configFilePath = cwdJoin('./public/static/config.json')
const packagePath = cwdJoin('./package.json')
const distDir = cwdJoin('./dist')
const { printParent } = require('./parten.js')
const mainJsTemplate = require('../utils/mainJsTemplate')
const mainJsTemplateLocal = require('../utils/mainJsTemplateLocal')
let fileArr = []
const getCompressFile = () => {
    fileArr = []
    if(fs.existsSync(distDir)) {
        if(fs.existsSync(cwdJoin('./dist/onlineupgrade.json'))) {
            const onlineConfig = getFileObjectContent(cwdJoin('./dist/onlineupgrade.json'))
            Object.values(onlineConfig).forEach(el => {
                fileArr.push(...el)
            })
            fileArr.push('onlineupgrade.json')
        }else {
            const list = fs.readdirSync(distDir)
            list.forEach(el => {
                if(path.extname(el) !== '.zip') {
                    fileArr.push(el)
                }
            })
        }
    }
}

const doCompress = async (packName, options) => {
    console.log(options)
    fs.chmodSync(cwdJoin('/'), 777);
    // config.json 是否存在
    const isConfigExit = fs.existsSync(configFilePath)
    let configFile = {}
    // 兼容idm-core
    if(isConfigExit) {
        configFile = getFileObjectContent(configFilePath)
    }else {
        configFile = getFileObjectContent(packagePath)
    }

    // 覆盖main选项
    const mainJsPath = cwdJoin('./dist/static/main.js')
    if((isConfigExit && !fs.existsSync(mainJsPath)) || options.main || options.mainLocal) {
        const cssFileList = fs.readdirSync(cwdJoin('./dist/static/css')), jsFileList = fs.readdirSync(cwdJoin('./dist/static/js'))
        const resourceObject = {js: {}}
        resourceObject.css = cssFileList.filter(el => path.extname(el) === '.css').map(el => `css/${path.basename(el, '.css')}`)
        jsFileList.forEach(el => {
            if(path.extname(el)==='.js') {
                resourceObject.js[el] = `js/${ path.basename(el, '.js')}`
            }
        })
        if(options.mainLocal) {
            resourceObject.js = jsFileList.map(js =>  `js/${ path.basename(js, '.js')}`)
        }
        let mainStr = mainJsTemplate(resourceObject)
        if(options.mainLocal) {
            mainStr = mainJsTemplateLocal(resourceObject, configFile.className, Date.now())
        }
        fs.writeFileSync(mainJsPath, mainStr, 'utf8')
        IDMLog.consoleG(`------> replaced main.js!`)
    }
    const outFileName = `${packName || configFile.className || configFile.name}@${configFile.version}@${timeFormat()}.zip`
    const outDir = cwdJoin(`./dist/${outFileName}`)
    console.log(`------> compressing dist files, please wait a moment!`)
    try {
        const zipStream = new compressing.zip.Stream()
        fileArr.forEach(el => zipStream.addEntry(cwdJoin('./dist/' + el)))
        zipStream.pipe(fs.createWriteStream(outDir));
        IDMLog.consoleG(`------> file: dist/${outFileName} compress complete!`)
        printParent()
    } catch(err) {
        console.error(err)
    }
}


module.exports = async (packName, options) => {
    getCompressFile()
    doCompress(packName, options)
}
