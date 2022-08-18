const fs = require('fs-extra')
const path = require('path')

const copyPluginFile = ({ pluginName, targetDir }) => {
    const pluginPath = path.resolve(targetDir + '/src/plugins')
    const cPluginPath = path.resolve(__dirname, '../frameworks/' + pluginName + '/plugins')
   
    fs.copySync(cPluginPath, pluginPath)
}
module.exports = {
    addPlugin(options) {
        copyPluginFile(options)
        const mainFilePath = path.resolve(options.targetDir+ '/src/' + options.mainFileName)
        let mainFile = fs.readFileSync(mainFilePath, 'utf8')
        const pluginImport = `import './plugins/${options.pluginName}.js'\r\n`
        fs.writeFileSync(mainFilePath, pluginImport + mainFile, 'utf8')
    }
}
