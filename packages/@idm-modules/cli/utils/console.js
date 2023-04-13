const chalk = require('chalk')

class IDMLog {

    static error(text) {
        console.error(chalk.red(text))
    }

    static consoleY(text) {
        console.log(chalk.yellow(text))
    }

    static consoleG(text) {
        console.log(chalk.green(text))
    }
}

module.exports = IDMLog