
/**
 * open: 開く処理
 * -----------------------------------------------------------------------------
 * ex. g open           ... 設定されたブラウザでサイトを開く
 * ex. g open --site    ... 既定のブラウザで開発サイトを開く
 * ex. g open --report  ... 既定のブラウザでテストレポートを開く
 * ex. g open --sendlog ... 既定のブラウザでsendlogページを開く
 * ex. g open --code    ... 管理フォルダをVisualStudioCodeで開く
 * ex. g open https://google.com
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const color = require('cli-color')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g open [Option|URL]')
		.options('site', {
			alias: 's',
			describe: '既定のブラウザで開発サイトを開く',
			boolean: true
		})
		.options('report', {
			alias: 'r',
			describe: '既定のブラウザでテストレポートを開く',
			boolean: true
		})
		.options('sendlog', {
			alias: 'l',
			describe: '既定のブラウザでsendlogページを開く',
			boolean: true
		})
		.options('code', {
			alias: 'c',
			describe: '管理フォルダをVisualStudioCodeで開く',
			boolean: true
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定
	let config = lib.loadConfig(argv);

	// 起動コマンド用意
	let opener = lib.isWindows()
		? 'start'
		: (lib.isMac
			? 'open'
			: 'xdg-open'
		)

	// URL指定
	argv._.shift()
	if(argv._.length) {
		for(let url of argv._) {
			child.exec(`${opener} ${url}`)
		}
	}

	// --site指定
	if(argv.s) child.exec(`${opener} ${getWorkingUrl(config)}`)

	// --report指定
	if(argv.r) child.exec(`${opener} ${config.root}/tests-report/mochawesome-report/mochawesome.html`)

	// --sendlog指定
	if(argv.l) child.exec(`${opener} ${getSendlogUrl(config)}`)

	// --code指定
	if(argv.c) child.exec(`code ${config.root}`)

	if(argv.s || argv.r || argv.l || argv.c || argv._.length) return

	// 引数未指定（config.jsに設定されているブラウザで開く）
	let url = getWorkingUrl(config)
	let cmds = [];
	if(!(config.http.browser.apps && config.http.browser.apps.length)) config.http.browser.apps = ['']
	for(let app of config.http.browser.apps) {
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
				 if(app==='chrome')  arg = ' -a "Google Chrome"'
			else if(app==='firefox') arg = ' -a firefox'
			else if(app==='safari')  arg = ' -a safari'
			else if(app==='opera')   arg = ' -a opera' // 未確認
			else if(app){
				arg = ` -a ${app}`
			}
		}
		cmds.push(`${opener}${arg} ${url}`)
	}

	// コマンド実行
	for(let cmd of cmds) {
		child.execSync(cmd)
	}

}

/**
 * 開発中のURLを返す
 */
function getWorkingUrl(config) {

	// コンテナが起動してるかチェック
	if(!lib.existContainers(config, '/'+config.base_name+'$'))
		lib.Error('dockerコンテナが起動していません: '+config.base_name)
	;

	// 開発中のURLを用意
	let port = lib.get_external_port(config, config.http.browser.schema==='https' ? 443 : 80)
	if(
		(config.http.browser.schema==='http' && port==80) ||
		(config.http.browser.schema==='https' && port==443)
	){
		port = ''
	} else {
		port = `:${port}`
	}
	let url = `${config.http.browser.schema}://${config.host_ip}${port}${config.http.browser.path}`

	return url
}

/**
 * SendlogのURLを返す
 */
function getSendlogUrl(config) {

	// コンテナが起動してるかチェック
	if(!lib.existContainers(config, '/'+config.base_name+'$'))
		lib.Error('dockerコンテナが起動していません: '+config.base_name)
	;

	// SendlogのURLを用意
	let port = lib.get_external_port(config, 9981)
	let url = `http://${config.host_ip}:${port}`

	return url
}
