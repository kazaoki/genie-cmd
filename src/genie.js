#!/usr/bin/env node

'use strict'

const lib = require('./libs.js')
const option = require('optimist')

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

 /**
 * 各コマンド機能を実行する
 * -----------------------------------------------------------------------------
 */
let cmd = argv._.shift()
     if(cmd==='demo')    require('./cmd-demo.js')(option)
// else if(cmd==='init')    require('./cmd-init.js')(option)
else if(cmd==='config')  require('./cmd-config.js')(option)
else if(cmd==='ls')      require('./cmd-ls.js')(option)
else if(cmd==='up')      require('./cmd-up.js')(option)
else if(cmd==='down')    require('./cmd-down.js')(option)
else if(cmd==='cli')     require('./cmd-cli.js')(option)
else if(cmd==='reject')  require('./cmd-reject.js')(option)
else if(cmd==='clean')   require('./cmd-clean.js')(option)
else if(cmd==='build')   require('./cmd-build.js')(option)
else if(cmd==='langver') require('./cmd-langver.js')(option)
else if(cmd==='mysql')   require('./cmd-mysql.js')(option)
else if(cmd==='psql')    require('./cmd-psql.js')(option)
else if(cmd==='open')    require('./cmd-open.js')(option)
// else if(cmd==='ngrok')   require('./cmd-ngrok.js')(option)
else if(cmd==='logs')    require('./cmd-logs.js')(option)
// else if(cmd==='dlsync')  require('./cmd-dlsync.js')(option)
else if(cmd==='test')    require('./cmd-test.js')(option)

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
		'warning',
		1
	)
	process.exit();
}
