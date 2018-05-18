
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

	// 指定がなければランモードを test に


	...






	lib.showRunmode()

	// オプション設定
	let argv = option
		.usage('Usage: genie|g test [Options] [test paths/files]')
		.options('open', {
			alias: 'o',
			describe: 'dockerホスト側のChromeブラウザで自動テストを実行する',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// GENIE_RUNMODE の指定はあるか

	// --modeの指定はあるか

	// なければ develop ではなく test モードでの実行に切り替え
	argv.mode = argv.m = 'test'

	// 設定読み込み
	let config = lib.loadConfig(argv);
	process.exit()

}
