
/**
 * up: 設定に基づいてdockerを起動する
 * -----------------------------------------------------------------------------
 * ex. g up
 *     g up -s
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const color = require('cli-color')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g up [Options]')
		.options('shadow', {
			alias: 's',
			describe: 'データをマウントではなくコンテナにコピーした別のコンテナを起動する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

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
				// lib.dockerDown('/'+config.run.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
				// lib.dockerDown('/'+config.run.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
				// lib.dockerDown('/'+config.run.base_name+'$', config), // 完全一致のgenie本体コンテナ名
				lib.dockerDown(null, config), // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
			]).catch(err=>err)
		}

		let rundb_funcs = []

		// PostgreSQL起動関数用意
		if(config.db.postgresql) {
			for(let key of Object.keys(config.db.postgresql)) {
				// h(`PostgreSQL起動:${key}`)
				rundb_funcs.push(lib.dockerUpPostgreSQL(key, config))
			}
		}

		// MySQL起動関数用意
		if(config.db.mysql) {
			for(let key of Object.keys(config.db.mysql)) {
				// h(`MySQL起動:${key}`)
				rundb_funcs.push(lib.dockerUpMySQL(key, config))
			}
		}

		// 先にDBを並列起動開始
		Promise.all(rundb_funcs)
			.catch(err=>{lib.Error(err)})
			.then(
				// 全てのDB起動完了したらgenie本体を開始する
				// h(`本体起動開始`)
				()=>lib.dockerUp(config).catch(err=>lib.Error(err))
			)

		// 全コンテナで準備完了するまで、ステータスファイルを監視
		console.log()
		let count = 0;
		let done = [];
		let line;
		do {
			line = [];

			// PostgreSQL
			if(config.db.postgresql && Object.keys(config.db.postgresql).length) {
				for(let key of Object.keys(config.db.postgresql)) {
					let container_name = `${config.run.base_name}-postgresql-${key}`
					let result = child.spawnSync('docker', ['exec', container_name, 'cat', '/var/log/init.log'])
					if(done.indexOf(container_name)!==-1 || result.stdout.toString().match(/Process start/)) {
						line.push(`  ${container_name} ... ${color.green('ready!')}`)
						if(done.indexOf(container_name)===-1) done.push(container_name);
					} else {
						line.push(`  ${container_name} ... ${color.yellow('loading')}`)
					}
				}
			}

			// MySQL
			if(config.db.mysql && Object.keys(config.db.mysql).length) {
				for(let key of Object.keys(config.db.mysql)) {
					let container_name = `${config.run.base_name}-mysql-${key}`
					let result = child.spawnSync('docker', ['exec', container_name, 'cat', '/var/log/init.log'])
					if(done.indexOf(container_name)!==-1 || result.stdout.toString().match(/Process start/)) {
						line.push(`  ${container_name} ... ${color.green('ready!')}`)
						if(done.indexOf(container_name)===-1) done.push(container_name);
					} else if(process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]) {
						line.push(`  ${container_name} ... ${color.yellow('image downloading')}`)
					} else {
						line.push(`  ${container_name} ... ${color.yellow('loading')}`)
					}
				}
			}

			// genie本体
			let result = child.spawnSync('docker', ['exec', config.run.base_name, 'cat', '/var/log/entrypoint.log'])
			let output = result.stdout.toString()
			if(done.indexOf(config.run.base_name)!==-1 || output.match(/entrypoint\.sh setup done\./)) {
				if(done.indexOf(config.run.base_name)===-1) done.push(config.run.base_name);
				line.push(`  genie ... ${color.green('ready!')}`)
			} else if(output.match(/init\.sh setup done\./)){
				line.push(`  genie ... ${color.yellow('init.sh setup')}`)
			} else if(output.match(/Postfix setup done\./)){
				line.push(`  genie ... ${color.yellow('Postfix setup')}`)
			} else if(output.match(/Nginx setup done\./)){
				line.push(`  genie ... ${color.yellow('Nginx setup')}`)
			} else if(output.match(/Apache setup done\./)){
				line.push(`  genie ... ${color.yellow('Apache setup')}`)
			} else if(output.match(/Node.js setup done\./)){
				line.push(`  genie ... ${color.yellow('Node.js setup')}`)
			} else if(output.match(/Ruby setup done\./)){
				line.push(`  genie ... ${color.yellow('Ruby setup')}`)
			} else if(output.match(/PHP setup done\./)){
				line.push(`  genie ... ${color.yellow('PHP setup')}`)
			} else if(output.match(/Perl setup done\./)){
				line.push(`  genie ... ${color.yellow('Perl setup')}`)
			} else if(output.match(/entrypoint\.sh setup start\./)){
				line.push(`  genie ... ${color.yellow('loading')}`)
			} else {
				line.push(`  genie ... ${color.yellow('waiting')}`)
			}

			// 状況出力
			if(count++) process.stdout.write(color.move.up(line.length));
			for(let string of line) {
				process.stdout.write(color.erase.line);
				console.log(string)
			}

			// 待ち
			if(done.length!==line.length) {
				await lib.sleep(100)
			}

		} while(done.length!==line.length)

		// ブラウザ起動
		;

		h('起動完了!!')
		process.exit();
	})();
};
