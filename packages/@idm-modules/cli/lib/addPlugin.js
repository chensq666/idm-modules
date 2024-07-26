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
        const mainFileName = options.scaffold === 'vue' ? 'main.js': 'index.ts'
        const mainFilePath = path.resolve(options.targetDir+ '/src/' + mainFileName)
        let mainFile = fs.readFileSync(mainFilePath, 'utf8')
        const pluginImport = `import './plugins/${options.pluginName}.js'\r\n`
        fs.writeFileSync(mainFilePath, pluginImport + mainFile, 'utf8')
        if(options.scaffold === 'vue') {
            const mainStaticFilePath = path.resolve(options.targetDir+ '/src/mainStatic.js')
            if(fs.existsSync(mainStaticFilePath)) {
                let mainStaticFile = fs.readFileSync(mainStaticFilePath, 'utf8')
                fs.writeFileSync(mainStaticFilePath, pluginImport + mainStaticFile, 'utf8')
            }
        }
    }
}
