
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

module.exports = async option=>{

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
		return lib.Message(option.help(), 'primary', 1)
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

	// テスト環境アップ
	await CMDS.up(option)

	// テスト前のコマンド実行
	if(config.test.before)
		child.execSync(config.test.before, {stdio: 'inherit'})

	// テストコマンド実行
	let result = child.execSync(config.test.run, {stdio: 'inherit'})

	// テスト後のコマンド実行
	if(config.test.after)
		child.execSync(config.test.after, {stdio: 'inherit'})

	// テスト環境ダウン
	await CMDS.down(option)
}
