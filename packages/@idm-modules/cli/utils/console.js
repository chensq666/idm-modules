const chalk = require('chalk')

const IDMLog = {
    error(text) {
        console.error(chalk.red(text))
    },
    consoleY(text) {
        console.log(chalk.yellow(text))
    },
    consoleG(text) {
        console.log(chalk.green(text))
    }
}

module.exports = IDMLog