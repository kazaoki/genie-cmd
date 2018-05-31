
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
const fs = require('fs')
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

	// 設定読み込み
	let config = lib.loadConfig(argv);

	// テストスクリプトがあるかチェック
	let test_dir = `${lib.getRootDir()}/tests/`;
	try {
		if(!fs.readdirSync(test_dir).length)
			throw new Error()
	} catch(err) {
		lib.Error(`${test_dir} にテストスクリプトを配置してください。`)
	}

	(async ()=>{

		// test環境アップ
		await CMDS.up(option)

		// テストスクリプト実行
		let args = [
			'npx',
			'mocha',
			'--reporter',
			'mochawesome',
			'--recursive',
			'tests',
			'--reporter-options',
			'reportDir=tests-report/mochawesome-report/,quiet=true',
		]
		lib.Message(`テストコマンドを実行します。\n${args.join(' ')}`, 'primary', 1)
		// CMD.open('-o ')


		// "test": "npx mocha --recursive tests --reporter mochawesome --reporter-options reportDir=tests-report/mochawesome-report/,quiet=true & start chrome tests-report/mochawesome-report/mochawesome.html",
		// n-mac": "npx mocha --recursive tests --reporter mochawesome --reporter-options reportDir=tests-report/mochawesome-report,quiet=true,autoOpen=true"








		// レポート表示

		// test環境ダウン
		await CMDS.down(option)

		process.exit()

	})()
}
