#!/usr/bin/env node

'use strict'

const inquirer = require('inquirer')
const opt = require('optimist')
const color = require('cli-color')
const child = require('child_process')
const cliui = require('cliui')({width: color.windowSize.width-4})
const lib = require('./libs.js')
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
		console.log('\n  DockeMachines')
		let result = child.spawnSync('docker-machine', ['ls'])
		if(result.status) lib.Error(result.stderr.toString())
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// イメージ一覧
	{
		console.log('\n  Images')
		let result = child.spawnSync('docker', ['images'])
		if(result.status) lib.Error(result.stderr.toString())
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// データボリューム一覧
	{
		console.log('\n  Volumes')
		let result = child.spawnSync('docker', ['volume', 'ls', '--format', 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}\t{{.Mountpoint}}'])
		if(result.status) lib.Error(result.stderr.toString())
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// コンテナ一覧
	{
		console.log('\n  Containers')
		let format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}']
		let header = ['NAMES', 'ID', 'IMAGE', 'STATUS', 'PORTS']
		if(argv.long) {
			format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Labels}}']
			header = ['NAMES', 'ID', 'IMAGE', 'COMMAND', 'CREATED AT', 'STATUS', 'PORTS', 'LABELS']
		}
		let result = child.spawnSync('docker', ['ps', '-a', ...format])
		if(result.status) lib.Error(result.stderr.toString())
		let lines = result.stdout.toString().trim().split('\n')
		lines.unshift(header.join('\t'))
		for(let i in lines) {
			let column = lines[i].split(/\t/)
			let set = []
			for(let j in column) {
				let width;
				if(!argv.long) {
					// if(j==0) width = 40 // NAMES
					// if(j==1) width = 15 // ID
					// // if(j==2) width = 30 // IMAGE
					if(j==4) width = 30 // PORTS
				} else {
					// if(j==0) width = 40 // NAMES
					// if(j==1) width = 15 // ID
					// // if(j==2) width = 30 // IMAGE
					if(j==6) width = 30 // PORTS
					if(j==7) width = 50 // LABELS
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
		.options('force', {
			alias: 'f',
			describe: 'lockedから始まる名前も対象にする',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(opt.help(), 'primary', 1)
		process.exit()
	}

	// コンテナ一覧取得
	let list_containers = []
	let result = child.spawnSync('docker', ['ps', '-qa', '--format', '{{.Names}}\t{{.Status}}'])
	if(result.status) lib.Error(result.stderr.toString())
	for(let line of result.stdout.toString().trim().split(/\n/)) {
		if(!line) continue
		let column = line.split(/\t/)
		let name = column[0]
		let status = column[1]
		let is_locked = name.match(/^locked_/)
		let label = `[Container] ${name}`
		if(is_locked) label = color.blackBright(label)
		list_containers.push({
			name: label,
			checked: (is_locked&&(!argv.f) ? false : true)
		})
	}

	// ボリューム一覧取得
	let list_volumes = []
	result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}\t{{.Driver}}'])
	if(result.status) lib.Error(result.stderr.toString())
	for(let line of result.stdout.toString().trim().split(/\n/)) {
		if(!line) continue
		let column = line.split(/\t/)
		let name = column[0]
		let driver = column[1]
		let is_locked = name.match(/^locked_/)
		let label = `[Volume] ${name}`
		if(is_locked) label = color.blackBright(label)
		list_volumes.push({
			name: label,
			checked: (is_locked&&(!argv.f) ? false : true)
		})
	}

	// 対象数カウント
	let list_count = list_containers.length + list_volumes.length
	if(list_count===0) {
		h('対象のオブジェクトはありませんでした。')
		process.exit()
	}

	console.log()
	inquirer.prompt([
		{
			type: 'checkbox',
			message: '削除したいものにチェックを入れて Enter してください。',
			name: 'rejects',
			pageSize: 100,
			choices: [
				...list_containers,
				...list_volumes,
			],
		}
	]).then(answers=>{

		// 画面クリア
		process.stdout.write(color.move.up(list_count));
		for(let i=0; i<list_count; i++){
			process.stdout.write(color.erase.line);
			process.stdout.write(color.move.down(1));
		}
		process.stdout.write(color.move.up(list_count-1));

		// 削除処理開始
		for(let label of answers.rejects) {
			label = color.strip(label);
			let matches = label.match(/^\[(Container|Volume)\] (.+)$/)
			// d(matches)

			// コンテナの削除
			if(matches[1]==='Container') {
				let name = matches[2];
				process.stdout.write(`  [Container] ${name} - `);
				let run = child.spawnSync('docker', ['rm', '-f', name])
				if(run.status) lib.Error(run.stderr.toString())
				process.stdout.write(color.green('deleted\n'));
			}
			// ボリュームの削除
			else if(matches[1]==='Volume') {
				let name = matches[2];
				process.stdout.write(`  [Volume] ${name} - `);
				let run = child.spawnSync('docker', ['volume', 'rm', '-f', name])
				if(run.status) lib.Error(run.stderr.toString())
				process.stdout.write(color.green('deleted\n'));
			}
		}
	});
}

/**
 * clean
 * -----------------------------------------------------------------------------
 */
else if(argv._[0]==='clean') {
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g clean [Options]')
		.options('force', {
			alias: 'f',
			describe: 'lockedから始まる名前も対象にする',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(opt.help(), 'primary', 1)
		process.exit()
	}

	let cmd;
	let result;
	let count = 0;

	// コンテナ削除（exitedなやつ）
	cmd = ['ps', '-qa', '--filter', 'exited=0', '--format', '{{.Names}}']
	result = child.spawnSync('docker', cmd)
	if(result.status) lib.Error(result.stderr.toString())
	for(let name of result.stdout.toString().trim().split(/\n/)) {
		if(!name) continue;
		if(!argv.f) if(name.match(/^locked_/i)) continue;
		if(!count++) console.log()
		process.stdout.write(`  [Container] ${name} - `);
		let run = child.spawnSync('docker', ['rm', '-fv', name])
		if(run.status) lib.Error(run.stderr.toString())
		process.stdout.write(color.green('deleted\n'));
	}

	// ボリューム削除（リンクされてないやつ）
	cmd = ['volume', 'ls', '--filter', 'dangling=true', '--format', '{{.Name}}']
	result = child.spawnSync('docker', cmd)
	if(result.status) lib.Error(result.stderr.toString())
	for(let name of result.stdout.toString().trim().split(/\n/)) {
		if(!name) continue;
		if(!argv.f) if(name.match(/^locked_/i)) continue;
		if(!count++) console.log()
		process.stdout.write(`  [Volume] ${name} - `);
		let run = child.spawnSync('docker', ['volume', 'rm', '-f', name])
		if(run.status) lib.Error(run.stderr.toString())
		process.stdout.write(color.green('deleted\n'));
	}

	// イメージ削除（<none>のやつ）
	cmd = ['images', '-q', '--filter', 'dangling=true']
	result = child.spawnSync('docker', cmd)
	if(result.status) lib.Error(result.stderr.toString())
	for(let id of result.stdout.toString().trim().split(/\n/)) {
		if(!id) continue;
		if(!count++) console.log()
		process.stdout.write(`  [Image] ${id} - `);
		let run = child.spawnSync('docker', ['rmi', id])
		if(run.status) lib.Error(run.stderr.toString())
		process.stdout.write(color.green('deleted\n'));
	}

	if(!count){
		h('対象のオブジェクトはありませんでした。')
	}

	process.exit()
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
		'  cli     コンテナ内でコマンドを実行。またはコンテナに入る\n'+
		'  reject  genie対象外のコンテナまたはボリュームを一括削除する\n'+
		'  clean   不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n'+
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
