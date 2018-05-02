#!/usr/bin/env node

'use strict'

const opt = require('optimist')
const lib = require('./libs.js');
const childProcess = require('child_process');

let argv = opt
	.usage('Usage: genie|g [Commands] [Options]')
	.options('mode', {
		alias: 'm',
		default: '',
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
 * demo
 * -----------------------------------------------------------------------------
 */
if(argv._[0]==='demo') {
	(async ()=>{

		// メッセージBOX
		console.log();
		lib.Message('サンプル：default', 'default')
		lib.Message('サンプル：primary', 'primary')
		lib.Message('サンプル：success', 'success')
		lib.Message('サンプル：danger', 'danger')
		lib.Message('サンプル：warning', 'warning')
		lib.Message('サンプル：info', 'info')
		lib.Message('改行込み、1ライン入れも可能。\ntest1\ntest2\ntest3', 'default', 1)

		// 入力BOX
		let input = await lib.Input('入力BOX（入力文字を発音しますのでご注意）：', 20);
		lib.Message('入力された文字：' + input);

		// sayテスト
		lib.Say(input);

		// エラーテスト
		try {
			throw new Error('エラーテスト（終了コード255）')
		} catch(err) {
			console.log(err)
			process.exit(255);
		}

		process.exit();

	})();

}

/**
 * ls
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='ls') {

	// docker-machine が使える環境の場合はそれも一覧する
	if(lib.hasDockerMachineEnv()) {
		console.log('\n  DockerMachine一覧')
		let result = childProcess.spawnSync('docker-machine', ['ls'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// イメージ一覧
	{
		console.log('\n  イメージ一覧')
		let result = childProcess.spawnSync('docker', ['images'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// データボリューム一覧
	{
		console.log('\n  データボリューム一覧')
		let result = childProcess.spawnSync('docker', ['volume', 'ls'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// コンテナ一覧
	{
		console.log('\n  コンテナ一覧')
		let result = childProcess.spawnSync('docker', ['ps', '-a'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	process.exit();
}

/**
 * clean
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='clean') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g clean [Options]')
		.options('locked', {
			alias: 'l',
			describe: '`locked`を含むDataVolumeも削除'
		})
		.argv;
	;
	if(argv.help) opt.showHelp()

	process.exit();
}

/**
 * help
 * -----------------------------------------------------------------------------
 */
else {
	console.error(
		opt.help()+'\n'+
		'Commands:\n'+
		'  init    \n'+
		'  config  \n'+
		'  ls      Dockerコンテナ状況を確認する\n'+
		'  up      \n'+
		'  down    \n'+
		'  update  \n'+
		'  cli     \n'+
		'  reject  \n'+
		'  clean   \n'+
		'  build   \n'+
		'  php     \n'+
		'  perl    \n'+
		'  ruby    \n'+
		'  mysql   \n'+
		'  psql    \n'+
		'  open    \n'+
		'  ngrok   \n'+
		'  logs    \n'+
		'  dlsync  \n'+
		'  httpd   \n'+
		'  spec    \n'+
		'  zap     \n'+
		'  demo    デモ\n'
	);

	process.exit();
}
