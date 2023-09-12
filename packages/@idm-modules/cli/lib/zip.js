const fs = require('fs')
const path = require('path')
const IDMLog = require('../utils/console')
const compressing = require('compressing')
const { cwdJoin, getFileObjectContent } = require('../utils/file')
const { timeFormat } = require('../utils/date')
const configFilePath = cwdJoin('./public/static/config.json')
const packagePath = cwdJoin('./package.json')
const distDir = cwdJoin('./dist')
let fileArr = []
const getCompressFile = () => {
    fileArr = []
    if(fs.existsSync(distDir)) {
        if(fs.existsSync(cwdJoin('./dist/onlineupgrade.json'))) {
            const onlineConfig = getFileObjectContent(cwdJoin('./dist/onlineupgrade.json'))
            Object.values(onlineConfig).forEach(el => {
                fileArr.push(...el)
            })
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

const doCompress = async (packName) => {
    // config.json 是否存在
    const isConfigExit = fs.existsSync(configFilePath)
    let configFile = {}
    if(isConfigExit) {
        configFile = getFileObjectContent(configFilePath)
    }else {
        configFile = getFileObjectContent(packagePath)
    }
    const outFileName = `${packName || configFile.className}@${configFile.version}@${timeFormat()}.zip`
    const outDir = cwdJoin(`./${outFileName}`)
    console.log(`------> compressing dist files, please wait a moment!`)
    try {
        const zipStream = new compressing.zip.Stream()
        fileArr.forEach(el => zipStream.addEntry(cwdJoin('./dist/' + el)))
        zipStream.pipe(fs.createWriteStream(outDir));
        fs.renameSync(outDir, cwdJoin(`./dist/${outFileName}`))
        IDMLog.consoleG(`------> file: dist/${outFileName} compress complete!`)
    } catch(err) {
        console.error(err)
    }
}


module.exports = async (packName, options) => {
    getCompressFile()
    doCompress(packName)
}
