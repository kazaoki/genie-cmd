#!/usr/bin/env node

import { EINPROGRESS } from 'constants';

'use strict'

const opt = require('optimist')
const color = require('cli-color')
const child = require('child_process');
const lib = require('./libs.js');
const d = lib.d
const h = lib.h

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

	// オプション設定
	let argv = opt
		.usage('Usage: genie|g ls [Options]')
		.options('long', {
			alias: 'l',
			describe: 'コンテナ一覧がもうちょっとだけ詳細に出ます'
		})
		.argv;
	;
	if(argv.help) {
		opt.showHelp()
		process.exit();
	}

	// docker-machine が使える環境の場合はそれも一覧する
	if(lib.hasDockerMachineEnv()) {
		console.log('\n  DockerMachine一覧')
		let result = child.spawnSync('docker-machine', ['ls'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// イメージ一覧
	{
		console.log('\n  イメージ一覧')
		let result = child.spawnSync('docker', ['images'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// データボリューム一覧
	{
		console.log('\n  データボリューム一覧')
		let result = child.spawnSync('docker', ['volume', 'ls'])
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// コンテナ一覧
	{
		console.log('\n  コンテナ一覧')
		let format = ['--format', 'table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}']
		if(argv.long) format = ['--format', 'table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}\t{{.Labels}}']
		let result = child.spawnSync('docker', ['ps', '-a', ...format])
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
			d(config)
		} else {
			// エディタで開く
			let config_js = `${lib.getProjectRootDir()}/.genie/${argv.config}`;
			if(lib.isWindows()) {
				child.execSync(`start ${config_js}`)
			} else if(lib.isMac()) {
				child.execSync(`open ${config_js}`)
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
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.perl) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.ruby) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.node) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else {
		opt.showHelp()
	}

	process.exit();
}

/**
 * up
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='up') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g up [Options]')
		.options('shadow', {
			alias: 's',
			describe: 'データをマウントではなくコンテナにコピーした別のコンテナを起動する'
		})
		.argv;
	;
	if(argv.help) opt.showHelp()

	// 設定ファイルロード
	let config = lib.loadConfig(argv);
	config.up = {} // upコマンド用設定を以降で自動追加するための場所

	// コンテナベース名定義
	config.up.base_name = argv.shadow
		? config.core.docker.name + '-SHADOW'
		: config.core.docker.name

	// ラベル名定義
	config.up.label = {
		genie_project_dir: lib.getProjectRootDir(),
	};
	if(argv.shadow) config.up.label.genie_shadow = 1

	// 起動時メモの表示
	try {
		let memo = config.core.memo.up
		if(memo) lib.Messages(memo);
	} catch(err) {
		Error('メモの設定が異常です。')
	}

	// // フィルターを用意
	// config.up.filters = [
	// 	'--filter',
	// 	'label=genie_project_dir="${label.genie_project_dir}"',
	// ]
	// if(argv.shadow) {
	// 	config.up.filters.push(
	// 		'--filter',
	// 		'label=genie_shadow=1'
	// 	)
	// }
	// let $filters = [
	// 	'--filter',
	// 	'label=genie_project_dir="${label.genie_project_dir}"',
	// ]
	// if(argv.shadow) {
	// 	$filters.push(
	// 		'--filter',
	// 		'label=genie_shadow=1'
	// 	)
	// }
	// let result = child.spawnSync('docker', ['ps', '-a', ...$filters])
	// lib.Message(result.stdout.toString(), 'primary', 1)


	(async()=>
	{

		// コンテナ作成テスト
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name, 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name+'-mysql-main', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name+'-mysql-sub', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name+'-postgresql-2015', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name+'-postgresql-2016', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name+'-postgresql-2017', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--name', config.up.base_name+'-postgresql-2018', 'centos', 'top']);

		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name, 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name+'-mysql-main', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name+'-mysql-sub', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name+'-postgresql-2015', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name+'-postgresql-2016', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name+'-postgresql-2017', 'centos', 'top']);
		// child.spawnSync('docker', ['run', '-d', '--label', `genie_project_dir="${config.up.label.genie_project_dir}"`, '--label', 'genie_shadow', '--name', config.up.base_name+'-postgresql-2018', 'centos', 'top']);

		// 各コンテナ終了
		if(lib.existContainers(config)) {
			// h('対象の既存コンテナのみ削除します', color.blackBright);
			await Promise.all([
				lib.dockerDown('/'+config.up.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
				lib.dockerDown('/'+config.up.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
				lib.dockerDown('/'+config.up.base_name+'$', config), // 完全一致のgenie本体コンテナ名
				// lib.dockerDown(null, config), // プロジェクトパスとshadowが一致するもの＝ゴミコンテナ削除
			]).catch(err=>err)
			// await lib.dockerDown(config);
		}

		let rundb_fucs =[]

		// PostgreSQL起動関数用意
		try {
			let keys = Object.keys(config.db.postgresql)
			if(keys.length) {
				// h('PostgreSQL起動開始')
				rundb_fucs.push(lib.dockerUp('postgresql', config))
			}
		} catch(err) { Error(err) }

		// MySQL起動関数用意
		try {
			let keys = Object.keys(config.db.mysql)
			if(keys.length) {
				// h('MySQL起動開始')
				rundb_fucs.push(lib.dockerUp('mysql', config))
			}
		} catch(err) { Error(err) }

		// 先にDBを起動開始
		await Promise.all(rundb_fucs).catch(err=>{lib.Error(err)})

		// genie本体起動関数用意
		// h('genie本体起動開始')
		lib.dockerUp('genie', config)

		// ブラウザ起動
		;

		h('起動完了!!')
		process.exit();
	})();
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
		'  up      Dockerコンテナを起動する\n'+
		'  down    \n'+
		'  update  \n'+
		'  cli     \n'+
		'  reject  \n'+
		'  clean   \n'+
		'  build   \n'+
		'  langver 各種言語の利用可能なバージョンを確認する\n'+
		'  mysql   \n'+
		'  psql    \n'+
		'  open    \n'+
		'  ngrok   \n'+
		'  logs    \n'+
		'  dlsync  \n'+
		'  httpd   \n'+
		// '  spec    \n'+
		// '  zap     \n'+
		'  demo    デモ\n'
	);

	process.exit();
}
