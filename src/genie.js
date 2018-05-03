#!/usr/bin/env node

'use strict'

// const fs = require('fs');
const opt = require('optimist')
const lib = require('./libs.js');
const childProcess = require('child_process');
const util = require('util');

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
 * config
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='config') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g config [Options]')
		.options('dump', {
			alias: 'd',
			describe: '設定値を確認します。'
		})
		.argv;
	;
	if(argv.help) opt.showHelp()
	else {

		// 設定ファイルロード
		let config = lib.loadConfig(argv);

		if(argv.dump){
			// 設定値を表示する
			console.log(util.inspect(config, {colors: true, compact: false, breakLength: 10, depth: 10}));
		} else {
			// エディタで開く
			let config_js = `${lib.getProjectRootDir()}/.genie/${argv.config}`;
			if(lib.isWindows()) {
				childProcess.execSync(`start ${config_js}`)
			} else if(lib.isMac()) {
				childProcess.execSync(`open ${config_js}`)
			}
		}
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
 * langs
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='langver') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g langver [Options]')
		.options('php', {describe: 'PHPの利用可能なバージョン一覧を表示'})
		.options('perl', {describe: 'Perlの利用可能なバージョン一覧を表示'})
		.options('ruby', {describe: 'Rubyの利用可能なバージョン一覧を表示'})
		.options('node', {describe: 'Node.jsの利用可能なバージョン一覧を表示'})
		.argv;
	;
	if(argv.help) {
		opt.showHelp()
	} else if(argv.php) {
		let result = childProcess.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.perl) {
		let result = childProcess.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.ruby) {
		let result = childProcess.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.node) {
		let result = childProcess.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else {
		opt.showHelp()
	}

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
		'  config  設定を確認する\n'+
		'  ls      Dockerコンテナ状況を確認する\n'+
		'  up      \n'+
		'  down    \n'+
		'  update  \n'+
		'  cli     \n'+
		'  reject  \n'+
		'  clean   \n'+
		'  build   \n'+
		'  langver \n'+
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
