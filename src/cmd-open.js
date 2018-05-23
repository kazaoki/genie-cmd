
/**
 * open: 設定されたURL情報を指定のブラウザで開く
 * -----------------------------------------------------------------------------
 * ex. g open
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const color = require('cli-color')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g open [Options]')
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 設定
	let config = lib.loadConfig(argv);

	// ブラウザで開く
	let cmd;
	if(lib.isWindows) {
		cmd = 'start'
	}else if(lib.isWindows) {
		cmd = 'open'
	} else {
		cmd = 'xdg-open'
	}
	let app = ''
	let internal_port = config.http.browser.schema==='https' ? 443 : 80
	let result = child.spawnSync('docker', ['port', config.base_name, internal_port])
	if(result.status) Error(result.stderr.toString())
	let matches = result.stdout.toString().trim().match(/(\d+)$/);
	let port = matches[1];
	if(
		(config.http.browser.schema==='http' && port==80) ||
		(config.http.browser.schema==='https' && port==443)
	){
		port = ''
	} else {
		port = `:${port}`
	}
	let url = `${config.http.browser.schema}://${config.host_ip}${port}${config.http.browser.path}`
	if(!(config.http.browser.apps && config.http.browser.apps.length)) config.http.browser.apps = ['']
	for(app of config.http.browser.apps) {
		let arg = ''
		if(lib.isWindows()) {
			     if(app==='chrome')  arg = ' chrome'
			else if(app==='firefox') arg = ' firefox' // できなかった
			else if(app==='ie')      arg = ' explorer'
			else if(app==='opera')   arg = ' opera' // 未確認
			else if(app){
				arg = ` ${app}`
			}
		} else {
			     if(app==='chrome')  arg = ' -a chrome'
			else if(app==='firefox') arg = ' -a firefox'
			else if(app==='safari')  arg = ' -a safari'
			else if(app==='opera')   arg = ' -a opera' // 未確認
			else if(app){
				arg = ` -a ${app}`
			}
		}
		d(`${cmd}${arg} ${url}`)
		child.execSync(`${cmd}${arg} ${url}`)
	}

	process.exit()
}
