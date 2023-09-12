const path = require('path')
const fs = require('fs')

function cwdJoin(dir) {
	return path.join(process.cwd(), dir)
}

function getFileObjectContent (filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function getFileContent (filePath) {
    return fs.readFileSync(filePath, 'utf-8')
}

module.exports = {
    cwdJoin,
    getFileContent,
    getFileObjectContent
}