#!/usr/bin/env node

'use strict'

/**
 * 標準引数定義
 * -----------------------------------------------------------------------------
 */
const option = require('optimist')
let argv = option
	.usage('Usage: genie|g [Commands] [Options]')
	.options('mode', {
		alias: 'm',
		default: 'develop',
		describe: '実行モードを指定可能'
	})
	.options('config', {
		alias: 'c',
		default: 'config.js',
		describe: '設定ファイルを指定可能'
	})
	.options('help', {
		alias: 'h',
		describe: '説明表示'
	})
	.argv
;

/**
 * 各コマンド機能を実行する
 * -----------------------------------------------------------------------------
 */
     if(argv._[0]==='demo')    require('./cmd-demo.js')(option)
// else if(argv._[0]==='init')    require('./cmd-init.js')(option)
else if(argv._[0]==='config')  require('./cmd-config.js')(option)
else if(argv._[0]==='ls')      require('./cmd-ls.js')(option)
else if(argv._[0]==='up')      require('./cmd-up.js')(option)
else if(argv._[0]==='down')    require('./cmd-down.js')(option)
else if(argv._[0]==='cli')     require('./cmd-cli.js')(option)
else if(argv._[0]==='reject')  require('./cmd-reject.js')(option)
else if(argv._[0]==='clean')   require('./cmd-clean.js')(option)
else if(argv._[0]==='build')   require('./cmd-build.js')(option)
else if(argv._[0]==='langver') require('./cmd-langver.js')(option)
// else if(argv._[0]==='mysql')   require('./cmd-mysql.js')(option)
// else if(argv._[0]==='psql')    require('./cmd-psql.js')(option)
else if(argv._[0]==='open')    require('./cmd-open.js')(option)
// else if(argv._[0]==='ngrok')   require('./cmd-ngrok.js')(option)
// else if(argv._[0]==='logs')    require('./cmd-logs.js')(option)
// else if(argv._[0]==='dlsync')  require('./cmd-dlsync.js')(option)

/**
 * help
 * -----------------------------------------------------------------------------
 */
else {
	const lib = require('./libs.js')
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
		'  mysql     \n'+
		'  psql      \n'+
		'  open      ブラウザで開く\n'+
		'  ngrok     \n'+
		'  logs      \n'+
		'  dlsync    \n'+
		'  httpd     \n'+
		'  demo      デモ\n',
		'warning',
		1
	)
	process.exit();
}
