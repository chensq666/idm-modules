const fs = require('fs');
const path = require('path')
const inquirer = require('inquirer')
const IDMLog = require('../utils/console')

function cwdJoin(dir) {
	return path.join(process.cwd(), dir)
}
function getComponentJson(className) {
	const jsonPath = cwdJoin(`/public/static/attributes/${className}.json`)
	if(!fs.existsSync(jsonPath)) {
		return IDMLog.error(`${className} component don't exists`)
	}
	return fs.readFileSync(jsonPath, 'utf-8')
}
function resolveComponentAttr(res, arr, level, index) {
	arr.forEach(item => {
		if (item.type != 'group') {
			const str = `${level[index]} ${item.text}【${item.bindKey}】`;
			const desc = item.desc || '';
			const biaoShi = `- 标识：\`${item.bindKey}\``;
			const moRenZhi = `- 默认值：${item.default ? item.default : '空'}`;
			res.push(str)
			res.push(desc)
			res.push(biaoShi)
			res.push(moRenZhi)
			if(item.display !== undefined) {
				const display = `- 显示：${item.display}`;
				res.push(display);
			}
			if(item.type == 'actionSelect') {
				const multiple = item.multiple ? '- 可设置函数数量：多个' : '- 可设置函数数量：单个';
				res.push(multiple)
			}
			if(['radio'].includes(item.type)) {
				let dictionaryArr = ['- 选项'];
				item.dictionary.map(it => {
					dictionaryArr.push(`\t - ${it.label}【${it.value}】`)
				})
				const dictionary = dictionaryArr.join('')
				res.push(dictionary)
			}
		} else {
			const str = `${level[index]} ${item.text}`;
			res.push(str);
			if (item.children?.length > 0) {
				resolveComponentAttr(res, item.children, level, (index + 1));
			}
		}
	})
}

function generateMd(mdPath, jsonContent) {
	const fileContentJson = JSON.parse(jsonContent);
	const configPath = cwdJoin('/public/static/config.json')
	const configJson = fs.readFileSync(configPath, 'utf-8')
	const configJsonObj = JSON.parse(configJson)
	let mdContent = ''
	let arr = fileContentJson.compositeAttr || [];
	let init = [
		`# ${fileContentJson.comName || '组件中文名'}`,
		'组件描述',
		`## 组件类ID（${fileContentJson.className}）`,
		fileContentJson.classId,
		'## 组件开发语言（comLangue）',
		fileContentJson.comLangue,
		'## 组件类型（comType）',
		fileContentJson.comType,
		'## 所在代码包版本',
		`${configJsonObj.className}@${configJsonObj.version}`,
		'## 组件属性'
	]
	let res = [];
	let level = ['###', '####', '#####', '######']
	resolveComponentAttr(res, arr, level, 0);
	mdContent = [...init, ...res].join('\r\n');
	fs.writeFile(mdPath, mdContent, (err) => {
		if(err) {
			IDMLog.error(err.message)
			return
		}
		IDMLog.consoleG(`${mdPath} generate success`)
	})
}

module.exports = async (className, options) => {
	const jsonContent = getComponentJson(className)
	const mdPath = cwdJoin(`/public/static/doc/components/${className}.md`)
	if(fs.existsSync(mdPath)){
		const answer = await inquirer.prompt({
			type: 'list',
			name: 'notice',
			message: `【${className}.md】 has exists, Do you want to cover it?`,
			default: 'yes',
			choices: ['yes', 'no']
		})
		if(answer.notice === 'yes') {
			generateMd(mdPath, jsonContent)
		}
	} else {
		generateMd(mdPath, jsonContent)
	}
}