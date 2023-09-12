const path = require('path')

function cwdJoin(dir) {
	return path.join(process.cwd(), dir)
}

module.exports = {
    cwdJoin
}