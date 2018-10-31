#!/usr/bin/env node

'use strict'

const option = require('optimist')
const child = require('child_process')
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

/**
 * ランモード設定
 * -----------------------------------------------------------------------------
 */
if(argv.mode) {
	// 引数指定が一番強い
	process.env.GENIE_RUNMODE = argv.mode
} else if(process.env.GENIE_RUNMODE) {
	// 引数無くて環境変数が入ってたらそれ
	argv.mode = process.env.GENIE_RUNMODE
} else {
	// 引数も環境変数も無ければ develop にする
	process.env.GENIE_RUNMODE = argv.mode = 'develop'
}

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
	 * 引数が標準でない場合
	 * -----------------------------------------------------------------------------
	 */
	else {
		// 設定ファイルロード
		let config = lib.loadConfig(argv);
		let custom = '';
		if(Object.keys(config.command).length) {
			for(let key of Object.keys(config.command)) {
				let space = 8 - key.length
				if(space<1) space = 1
				custom += `  ${key} ${lib.Repeat(' ', space)} ${config.command[key]}\n`;
			}
		}

		// 引数がカスタムコマンドに登録されていたら起動中のコンテナの中で実行する
		if(config.command[cmd]) {
			// dockerが起動しているか
			if(!lib.existContainers(config, `/${config.base_name}$`)) lib.Error('dockerコンテナが起動していません: '+config.base_name)

			// コマンド実行
			child.spawnSync('docker', ['exec', '-it', config.base_name, 'bash', '-c', `${config.command[cmd]}`], {stdio: 'inherit'})
		}

		// それでも引数がなければヘルプを表示する
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
				'  cli       コンテナ内でコマンドを実行。またはコンテナに入る\n'+
				'  reject    genie対象外のコンテナまたはボリュームを一括削除する\n'+
				'  clean     不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n'+
				'  build     基本のdockerイメージをビルドする\n'+
				'  mysql     MySQLクライアント実行\n'+
				'  psql      PostgreSQLクライアント実行\n'+
				'  open      ブラウザで開く\n'+
				'  logs      実行ログを見る\n'+
				'  dlsync    LFTPを利用したダウンロード方向のみのミラーリングを実行する\n'+
				'  httpd     \n'+
				'  test      テストを実行する\n'+
				'  demo      デモ\n'+
				'  version   バージョン表示\n'+
				(custom ? custom : ''),
				'warning',
				1
			)
		}
	}

	// done.
	process.stdout.write('\n')
	console.timeEnd('  Done')
	process.stdout.write('\n')

})()
