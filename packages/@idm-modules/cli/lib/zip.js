const fs = require('fs')
const compressing = require('compressing')
const { cwdJoin } = require('../utils/file')
const removeFile = (fileName) => fs.unlinkSync(fileName)
const { timeFormat } = require('../utils/date')

let configFile = JSON.parse(fs.readFileSync(cwdJoin('./public/static/config.json'), 'utf-8'))

const fileName = cwdJoin(`./${configFile.className}@${configFile.version}@${timeFormat()}.zip`)

const distDir = cwdJoin('./dist')

const doPress = async () => {
    try {
        await compressing.zip.compressDir(distDir, fileName, { ignoreBase: true })
    } catch(err) {
        console.error(err)
        removeFile(fileName)
    }
}


module.exports = async (className, options) => {
    doPress()
}
