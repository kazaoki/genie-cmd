#!/usr/bin/env node

'use strict'

const opt = require('optimist')
const color = require('cli-color')
const child = require('child_process');
const cliui = require('cliui')();
const lib = require('./libs.js');
const d = lib.d
const h = lib.h

let argv = opt
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
		let format = ['--format', '{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}']
		let header = ['ID', 'IMAGE', 'STATUS', 'PORTS', 'NAMES']
		if(argv.long) {
			format = ['--format', '{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}\t{{.Labels}}']
			header = ['ID', 'IMAGE', 'COMMAND', 'CREATED AT', 'STATUS', 'PORTS', 'NAMES', 'LABELS']
		}
		// if(argv.long) format = ['--format', 'table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}']
		let result = child.spawnSync('docker', ['ps', '-a', ...format])

		let lines = result.stdout.toString().trim().split('\n')
		if(argv.long) {
			lines.unshift('CONTAINER ID\tIMAGE\tCOMMAND\tCREATED AT\tSTATUS\tPORTS\tNAMES\tLABELS')
		} else {
			lines.unshift('CONTAINER ID\tIMAGE\tSTATUS\tPORTS\tNAMES')
		}

		for(let i in lines) {
			let column = lines[i].split(/\t/)
			let set = []
			for(let j in column) {
				let width;
				if(!argv.long) {
					if(j==0) width = 15 // CONTAINER ID
					// if(j==1) width = 30 // IMAGE
					if(j==3) width = 30 // PORTS
					if(j==4) width = 40 // NAMES
				} else {
					if(j==0) width = 15 // CONTAINER ID
					// if(j==1) width = 30 // IMAGE
					if(j==5) width = 30 // PORTS
					if(j==6) width = 40 // NAMES
					if(j==7) width = 90 // LABELS
				}
				set.push({
					text: column[j].replace(/, ?/g, '\n'),
					width: width,
					padding: [0, 1, 0, 1],
				})
			}
			cliui.div(...set)
		}

		lib.Message(cliui.toString(), 'primary', 1)

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
 * langver
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

	// 起動時メモの表示
	try {
		let memo = config.core.memo.up
		if(memo) lib.Messages(memo);
	} catch(err) {
		Error('メモの設定が異常です。')
	}

	(async()=>
	{
		// 各コンテナ終了
		if(lib.existContainers(config)) {
			// h('対象の既存コンテナのみ削除します', color.blackBright);
			await Promise.all([
				lib.dockerDown('/'+config.run.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
				lib.dockerDown('/'+config.run.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
				lib.dockerDown('/'+config.run.base_name+'$', config), // 完全一致のgenie本体コンテナ名
				lib.dockerDown(null, config), // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
			]).catch(err=>err)
		}

		let rundb_fucs = []

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
		await lib.dockerUp('genie', config).catch(err=>lib.Error(err))

		// ブラウザ起動
		;

		h('起動完了!!')
		process.exit();
	})();
}

/**
 * down
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='down') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g down [Options]')
		.options('shadow', {
			alias: 's',
			describe: 'データをマウントではなくコンテナにコピーした別のコンテナを終了する'
		})
		.argv;
	;
	if(argv.help) {
		opt.showHelp()
		process.exit()
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 終了時メモの表示
	try {
		let memo = config.core.memo.down
		if(memo) lib.Messages(memo);
	} catch(err) {
		Error('メモの設定が異常です。')
	}

	(async()=>
	{
		// 各コンテナ終了
		if(lib.existContainers(config)) {
			// h('対象の既存コンテナのみ削除します', color.blackBright);
			await Promise.all([
				lib.dockerDown('/'+config.run.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
				lib.dockerDown('/'+config.run.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
				lib.dockerDown('/'+config.run.base_name+'$', config), // 完全一致のgenie本体コンテナ名
				lib.dockerDown(null, config), // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
			]).catch(err=>err)
		}

		h('DONE!')
		process.exit();
	})();
}

/**
 * build
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='build') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g build [Options]')
		.options('no-cache', {
			alias: 'n',
			describe: 'キャッシュを使用せずにビルドする',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(opt.help(), 'success', 1)
		process.exit()
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	(async()=>
	{
		// 確認
		let input = await lib.Input(`${config.core.docker.image} イメージをビルドしてもよろしいでしょうか。[y/N]: `)

		// ビルド実行
		if(input.match(/^y$/i)) {
			let args = ['build', '-t', config.core.docker.image]
			if(argv['no-cache']) args.push('--no-cache')
			args.push(`${lib.getProjectRootDir()}/.genie/image/`)
			lib.Message(`ビルドを開始します。\ndocker ${args.join(' ')}`, 'info');
			console.log()
			let stream = child.spawn('docker', args);
			stream.stdout.on('data', (data)=>{
				console.log(color.blackBright(data.toString().trim()))
			})
			stream.stderr.on('data', (data)=>{
				lib.Error(data)
				process.exit();
			})
			stream.on('close', (code) => {
				let mes = 'ビルドが完了しました。'
				lib.Message(mes)
				lib.Say(mes)
				process.exit();
			});
		}
	})();
}

/**
 * cli
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='cli') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g cli [Options] [Commands]')
		.options('host', {
			describe: '実行するホスト名を指定する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(opt.help(), 'primary', 1)
		process.exit()
	}

	// 設定
	let config = lib.loadConfig(argv);
	let host = argv.host ? argv.host : config.core.docker.name
	let cmds = process.argv.slice(process.argv.findIndex(elem=>elem===argv._[1])) // ちょっと強引だけど、デフォ引数を省いた位置から末尾までをコマンドラインとして取得する

	// dockerが起動しているか
	if(!lib.existContainers(config, '/'+host+'$')) lib.Error('dockerコンテナが起動していません: '+host)

	// 引数があれば実行して結果を返す
	if(argv._.length!==1) {
		let result = child.spawnSync('docker', ['exec', host, ...cmds]);
		if(result.status) {
			lib.Error(result.stderr.toString() || result.stdout.toString()) // dockerを通してるため stderr ではなく stdout 側にメッセージが流れてくる場合があるため
			process.exit()
		}
		console.log(result.stdout.toString())
		process.exit()
	}

	// 引数が無ければコマンドラインに入る
	else {
		child.spawnSync('docker', ['exec', '-it', host, 'bash'], {stdio: 'inherit'})
		process.exit()
	}

}

/**
 * reject
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='reject') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g reject [Options]')
		.options('volumes', {
			alias: 'v',
			describe: 'ボリュームを対象にする',
			default: false
		})
		.options('force', {
			alias: 'f',
			describe: 'lockedから始まる名前も対象にする',
			default: false
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(opt.help(), 'primary', 1)
		process.exit()
	}

	// 一覧取得
	let result = child.spawnSync('docker',
		argv.v
			? ['volume', 'ls', '-q']
			: ['ps', '-qa']
	)
	if(result.status) {
		lib.Error(result.stderr.toString())
	}
	let ids = []
	for(let id of result.stdout.toString().trim().split(/\n/)) {
		if(!argv.f) if(id.match(/^locked_/i)) continue;
		if(id) ids.push(id)
	}
	if(ids.length===0) {
		h(`対象の${argv.v?'ボリューム':'コンテナ'}は見つかりませんでした。`)
		process.exit()
	}

	// 削除処理
	for(let id of ids) {
		process.stdout.write(`  ${id} - `);
		let del_result = child.spawnSync('docker',
			argv.v
				? ['volume', 'rm', '-f', id]
				: ['rm', '-f', id]
		)
		if(del_result.status) {
			lib.Error(del_result.stderr.toString())
		}
		process.stdout.write(color.green('deleted\n'));
	}

	process.exit()

}

/**
 * clean
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='clean') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g clean [Options]')
		.options('list', {
			alias: 'l',
			describe: 'イメージ・コンテナ・ボリュームの一覧から選んで削除する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(opt.help(), 'primary', 1)
		process.exit()
	}

	// 一覧取得
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
		'  up      設定に基づきDockerコンテナを起動する\n'+
		'  down    関連するコンテナのみ終了する\n'+
		'  update  \n'+
		'  cli     コンテナ内でコマンドを実行。またはコンテナに入る。\n'+
		'  reject  lockedから始まる名前以外のコンテナ・ボリュームを削除する\n'+
		'  clean   \n'+
		'  build   基本のdockerイメージをビルドする\n'+
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
