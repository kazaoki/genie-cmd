
/**
 * test: テストを実行
 * -----------------------------------------------------------------------------
 * ex. g test
 *     g test t
 *     g test --open
 *
 * このコマンドは環境変数`GENIE_RUNMODE`や`--mode`引数を指定しなければ、自動的に実行モードが 'test' になる。
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const inquirer = require('inquirer')
const color = require('cli-color')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g test [Options] [test paths/files]')
		.options('mode', {
			alias: 'M',
			default: 'test',
			describe: '実行モードを指定可能（test時はデフォルト`test`）'
		})
		.options('open', {
			alias: 'o',
			describe: 'dockerホスト側のChromeブラウザを開きオートテストを実行する',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}
	// ランモードを環境変数にセット
	process.env.GENIE_RUNMODE = argv.mode

	// ランモード表示
	lib.showRunmode()

	// 設定読み込み
	let config = lib.loadConfig(argv);
	process.exit()

}
