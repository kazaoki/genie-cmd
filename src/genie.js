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
	demo:      require('./cmd-demo.js'),
	// init:      require('./cmd-init.js'),
	config:    require('./cmd-config.js'),
	ls:        require('./cmd-ls.js'),
	up:        require('./cmd-up.js'),
	down:      require('./cmd-down.js'),
	cli:       require('./cmd-cli.js'),
	reject:    require('./cmd-reject.js'),
	clean:     require('./cmd-clean.js'),
	build:     require('./cmd-build.js'),
	langver:   require('./cmd-langver.js'),
	mysql:     require('./cmd-mysql.js'),
	psql:      require('./cmd-psql.js'),
	open:      require('./cmd-open.js'),
	// ngrok:     require('./cmd-ngrok.js'),
	logs:      require('./cmd-logs.js'),
	dlsync:    require('./cmd-dlsync.js'),
	test:      require('./cmd-test.js'),
	version:   require('./cmd-version.js'),
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

// ランモードを環境変数にセット
process.env.GENIE_RUNMODE = argv.mode

~(async ()=>{

	/**
	* 各コマンド機能を実行する
	* -----------------------------------------------------------------------------
	*/
	let cmd = argv._.shift()
		 if(cmd==='demo')    await CMDS.demo(option)
	// else if(cmd==='init')    await CMDS.init(option)
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
			'  init      \n'+
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
			'  dlsync    \n'+
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
