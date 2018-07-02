#!/usr/bin/env node

'use strict'

const option = require('optimist')
const lib = require('./libs.js')
global.d = lib.d
global.h = lib.h

// 時間計測開始
console.time('  Done')

/**
 * 各機能のファイルを読み込み
 * -----------------------------------------------------------------------------
 */
global.CMDS = {
	demo:      option=>{return require('./cmd-demo.js')(option)},
	init:      option=>{return require('./cmd-init.js')(option)},
	config:    option=>{return require('./cmd-config.js')(option)},
	ls:        option=>{return require('./cmd-ls.js')(option)},
	up:        option=>{return require('./cmd-up.js')(option)},
	down:      option=>{return require('./cmd-down.js')(option)},
	cli:       option=>{return require('./cmd-cli.js')(option)},
	reject:    option=>{return require('./cmd-reject.js')(option)},
	clean:     option=>{return require('./cmd-clean.js')(option)},
	build:     option=>{return require('./cmd-build.js')(option)},
	langver:   option=>{return require('./cmd-langver.js')(option)},
	mysql:     option=>{return require('./cmd-mysql.js')(option)},
	psql:      option=>{return require('./cmd-psql.js')(option)},
	open:      option=>{return require('./cmd-open.js')(option)},
	// ngrok:     option=>{return require('./cmd-ngrok.js')(option)},
	logs:      option=>{return require('./cmd-logs.js')(option)},
	dlsync:    option=>{return require('./cmd-dlsync.js')(option)},
	test:      option=>{return require('./cmd-test.js')(option)},
	version:   option=>{return require('./cmd-version.js')(option)},
}

/**
 * 標準引数定義
 * -----------------------------------------------------------------------------
 */
let argv = option
	.usage('Usage: genie|g [Commands] [Options]')
	.options('mode', {
		alias: 'M',
		default: 'develop',
		describe: '実行モードを指定可能'
	})
	.options('config', {
		alias: 'C',
		default: 'config.js',
		describe: '設定ファイルを指定可能'
	})
	.options('help', {
		alias: 'h',
		describe: '説明表示'
	})
	.argv
;

// ランモードを環境変数にセット（すでにGENIE_RUNMODEが用意されてる環境ならそっちを優先する。※test時を除く）
if(!process.env.GENIE_RUNMODE) process.env.GENIE_RUNMODE = argv.mode

~(async ()=>{

	/**
	* 各コマンド機能を実行する
	* -----------------------------------------------------------------------------
	*/
	let cmd = argv._.shift()
		 if(cmd==='demo')    await CMDS.demo(option)
	else if(cmd==='init')    await CMDS.init(option)
	else if(cmd==='config')  await CMDS.config(option)
	else if(cmd==='ls')      await CMDS.ls(option)
	else if(cmd==='up')      await CMDS.up(option)
	else if(cmd==='down')    await CMDS.down(option)
	else if(cmd==='cli')     await CMDS.cli(option)
	else if(cmd==='reject')  await CMDS.reject(option)
	else if(cmd==='clean')   await CMDS.clean(option)
	else if(cmd==='build')   await CMDS.build(option)
	else if(cmd==='langver') await CMDS.langver(option)
	else if(cmd==='mysql')   await CMDS.mysql(option)
	else if(cmd==='psql')    await CMDS.psql(option)
	else if(cmd==='open')    await CMDS.open(option)
	// else if(cmd==='ngrok')   await CMDS.ngrok(option)
	else if(cmd==='logs')    await CMDS.logs(option)
	else if(cmd==='dlsync')  await CMDS.dlsync(option)
	else if(cmd==='httpd')   await CMDS.httpd(option)
	else if(cmd==='test')    await CMDS.test(option)
	else if(cmd==='version') await CMDS.version(option)

	/**
	 * help
	 * -----------------------------------------------------------------------------
	 */
	else {
		console.log()
		lib.Message(
			option.help()+'\n'+
			'Commands:\n'+
			'  init      現在のディレクトリに .genie/ を作成します。\n'+
			'  config    設定を確認する\n'+
			'  ls        Dockerコンテナ状況を確認する\n'+
			'  up        設定に基づきDockerコンテナを起動する\n'+
			'  down      関連するコンテナのみ終了する\n'+
			'  update    \n'+
			'  cli       コンテナ内でコマンドを実行。またはコンテナに入る\n'+
			'  reject    genie対象外のコンテナまたはボリュームを一括削除する\n'+
			'  clean     不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n'+
			'  build     基本のdockerイメージをビルドする\n'+
			'  langver   各種言語の利用可能なバージョンを確認する\n'+
			'  mysql     MySQLを操作する\n'+
			'  psql      PostgreSQLを操作する\n'+
			'  open      ブラウザで開く\n'+
			'  ngrok     \n'+
			'  logs      実行ログを見る\n'+
			'  dlsync    FTPを利用したダウンロード方向のみのミラーリングを実行する\n'+
			'  httpd     \n'+
			'  test      \n'+
			'  demo      デモ\n',
			'  version   バージョン表示\n',
			'warning',
			1
		)
	}

	// done.
	process.stdout.write('\n')
	console.timeEnd('  Done')
	process.stdout.write('\n')

})()
