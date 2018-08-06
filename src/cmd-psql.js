
/**
 * psql: psql操作
 * -----------------------------------------------------------------------------
 * ex. g psql
 *     g psql --cli
 *     g psql --cli -n container1
 *     g psql --dump
 *     g psql --dump -n container1  -n container2
 *     g psql --restore
 *     g psql --restore -n container1  -n container2
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const inquirer = require('inquirer')
const fs = require('fs')
const rotate = require('log-rotate')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g psql [Options]')
		.options('cli', {
			alias: 'c',
			describe: 'PostgreSQLコンテナのCLIに入る',
			boolean: true,
		})
		.options('dump', {
			alias: 'd',
			describe: 'PostgreSQLのダンプを取る',
			boolean: true,
		})
		.options('restore', {
			alias: 'r',
			describe: 'PostgreSQLのリストアを行う',
			boolean: true,
		})
		.options('all', {
			alias: 'a',
			describe: '管轄全てのPostgreSQLを対象とする。（--dump, --restore時のみ）',
			boolean: true,
		})
		.options('no-rotate', {
			alias: 'n',
			describe: 'ダンプファイルのローテーションを行わない。（--dump時のみ）',
			boolean: true,
		})
		.options('output-dir', {
			alias: 'o',
			describe: 'ダンプファイルの出力先を指定。（--dump時のみ、ホスト側のフルパス指定）',
		})
		.options('gzip', {
			alias: 'g',
			describe: 'ダンプファイルは圧縮。（--dump時に影響）',
			boolean: true,
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定
	let config = lib.loadConfig(argv);
	if(!(config.db.postgresql && Object.keys(config.db.postgresql).length)) {
		lib.Error('PostgreSQL設定がありません。')
	}

	// dockerが起動しているか
	if(!lib.existContainers(config, '/'+config.base_name+'$')) {
		lib.Error('dockerコンテナが起動していません: '+config.base_name)
	}

	// --cli: PostgreSQLコンテナの中に入る
	if(argv.cli) {
		let container_name = argv._[1]
			? `${config.base_name}-postgresql-${argv._[1]}`
			: await get_target_containers(config, {is_single:true}, 'コマンドラインに入るPostgreSQLコンテナを選択してください。')
		let key = get_key_from_container_name(config, container_name)
		child.spawnSync('docker', [
			'exec',
			'-it',
			container_name,
			'bash',
		],
			{stdio: 'inherit'}
		)
	}

	// --dump: ダンプを取る
	else if(argv.dump) {
		// 対象のコンテナを特定
		argv._.shift()

		// 対象キーを設定
		let keys = argv.all
			? Object.keys(config.db.postgresql)
			: argv._.length
				? argv._
				: await get_target_containers(config, {has_all:true, is_key_return:true}, 'ダンプを取るPostgreSQLコンテナを選択してください。')
		if(!Array.isArray(keys)) keys = [keys]

		// ダンプを保存するディレクトリが無ければ作成する
		let dump_dir = `${config.root}/.genie/files/opt/postgresql/dumps`
		if(argv.o) dump_dir = argv.o.replace(/\/$/, '')
		if(!fs.existsSync(dump_dir)) fs.mkdirSync(dump_dir, 0o755)

		// キーごとに回す
		let funcs = [];
		for(let key of keys){
			let container_name = `${config.base_name}-postgresql-${key}`
			funcs.push({
				label: container_name,
				proc: 'dumping',
				ok: 'dumped!',
				ng: 'failed!',
				func: new Promise(async (ok, ng)=>
				{
					// キー名チェック
					if(!config.db.postgresql[key]) ng('指定のキーのPostgreSQL設定が定義されていません。'+key)
					let postgresql = config.db.postgresql[key]

					// ダンプファイルローテーション
					if(!argv.n) {
						let dump_file = `${dump_dir}/${key}.sql${argv.g?'.gz':''}`
						if(fs.existsSync(dump_file)) {
							await new Promise((resolve, reject)=>{
								rotate(dump_file, { count: config.db.postgresql[key].dump_genel+1 }, err=>{
									err
										? reject(err)
										: resolve()
								});
							})
						}
					}

					// ダンプ用コンテナを起動する
					let run_docker =
						'docker run -d'+
						` --name ${container_name}-dumper`+
						` --link ${container_name}`+
						` -v ${dump_dir}:/dumps/`+
						(config.core.docker.network ? ` --net=${config.core.docker.network}` : '')+
						(config.core.docker.options ? ` ${config.core.docker.options}` : '')+
						` ${postgresql.repository}`+
						' postgres'
					;
					child.execSync(run_docker)

					// ダンプ実行前に.pgpassを保存（パスワード入力いらないように
					let exec_pgpass =
						'docker exec'+
						` ${container_name}-dumper`+
						` sh -c "echo '${container_name}:5432:${postgresql.name}:${postgresql.user}:${postgresql.pass}' > /root/.pgpass && chmod 0600 /root/.pgpass"`
					;
					child.execSync(exec_pgpass)

					// ダンプ実行
					let exec_dump =
						'docker exec'+
						` ${container_name}-dumper`+
						` sh -c "pg_dump ${postgresql.name} -U ${postgresql.user} -h ${container_name} | gzip > /dumps/${key}.sql${argv.g?'.gz':''}"`
					;
					child.exec(exec_dump, (error, stdout, stderr)=>{
						child.exec(`docker rm -fv ${container_name}-dumper`)
						error && ng(error)
						ok()
					})
				})
			})
		}

		// 並列プログレス表示
		await lib.para_progress(funcs)
	}

	// --restore: リストアする
	else if(argv.restore) {

		// 対象のコンテナを特定
		argv._.shift()

		// 対象キーを設定
		let keys = argv.all
			? Object.keys(config.db.postgresql)
			: argv._.length
				? argv._
				: await get_target_containers(config, {has_all:true, is_key_return:true}, 'リストアするPostgreSQLコンテナを選択してください。')
		if(!Array.isArray(keys)) keys = [keys]

		// リストア実行
		let funcs = [];
		for(let key of keys) {
			let container_name = `${config.base_name}-postgresql-${key}`
			funcs.push({
				label: container_name,
				proc: 'restoring',
				ok: 'restored!',
				ng: 'failed!',
				func: new Promise((ok, ng)=>{

					// リストア用コマンドファイルをロード
					child.exec(`docker exec ${container_name} sh -c "cat /docker-run.cmd"`, (error, stdout, stderr)=>{
						let reloader = stdout.toString().trim();
						error && ng(error)

						// 既存のコンテナを終了する
						let volume_container_name = get_volume_container_name(container_name)
						child.exec(`docker rm -f ${container_name}`, (error, stdout, stderr)=>{
							error && ng(error)

							// ボリュームも消す
							child.exec(`docker volume rm -f ${volume_container_name}`, (error, stdout, stderr)=>{

								// 新たにコンテナを立ち上げる
								child.exec(reloader, (error, stdout, stderr)=>{
									error && ng(error)

									// コンテナ直下に起動用コマンドを記録する（restore用）
									child.exec(`docker exec ${container_name} sh -c "echo '${reloader}' > /docker-run.cmd"`, (error, stdout, stderr)=>{
										error && ng(error)

										// 起動処理が終わるまで待機
										let waiter = ()=>{
											let result = child.spawnSync('docker', [
												'exec',
												container_name,
												'sh',
												'-c',
												'ps aux|grep entrypoint.sh|grep -v grep|wc -l',
											])
											if(result.stdout.toString().trim()==='0') {
												ok()
											} else {
												setTimeout(waiter, 1000)
											}
										}
										setTimeout(waiter, 1000)
									})
								})
							})
						})
					})
				})
			})
		}

		// 並列プログレス表示
		await lib.para_progress(funcs)

	}

	// psqlコマンドに入る
	else {
		let container_name = argv._[1]
			? `${config.base_name}-postgresql-${argv._[1]}`
			: await get_target_containers(config, {is_single:true}, 'psqlコマンドラインに入るPostgreSQLコンテナを選択してください。')
		let key = get_key_from_container_name(config, container_name)
		if(!config.db.postgresql[key]) lib.Error('指定のキーのPostgreSQL設定が定義されていません。'+argv._[1])
		child.spawnSync('docker', [
			'exec',
			'-it',
			container_name,
			'psql',
			config.db.postgresql[key].name,
			'-U',
			config.db.postgresql[key].user
		],
			{stdio: 'inherit'}
		)
	}
}

/**
 * コンテナを選択させる
 */
function get_target_containers(config, option={}, message)
{
	// １つしかなければそれ
	if(Object.keys(config.db.postgresql).length===1) {
		return option.is_key_return
			? Object.keys(config.db.postgresql)[0]
			: `${config.base_name}-postgresql-${Object.keys(config.db.postgresql)[0]}`
	}

	// ２つ以上あれば選択肢
	return (async ()=>{
		let key
		let container_name

		// 選択肢用意
		let list = []
		for(let name of Object.keys(config.db.postgresql)) {
			list.push(`${name} (${config.base_name}-postgresql-${name})`)
		}

		// 選択開始
		if(option.has_all) list.push('全て')
		console.log()
		let result = await inquirer.prompt([
			{
				type: 'list',
				message: message,
				name: 'container',
				pageSize: 100,
				choices: list
			}
		]).catch(err=>{
			lib.Error(err)
		})

		// 選択肢返却
		if(result.container==='全て') {
			return option.is_key_return
				? Object.keys(config.db.postgresql)
				: Object.keys(config.db.postgresql).map(key=>`${config.base_name}-postgresql-${key}`)
		} else {
			let matches = result.container.match(/^(\w+) /)
			return option.is_key_return
				? matches[1]
				: `${config.base_name}-postgresql-${matches[1]}`
		}

	})()
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key
	for(let tmpkey of Object.keys(config.db.postgresql)) {
		if(container_name === `${config.base_name}-postgresql-${tmpkey}`) {
			key = tmpkey
			break
		}
	}
	return key
}

/**
 * コンテナからボリューム名を取得
 */
function get_volume_container_name(container_name) {
	let volumes = child.execSync('docker volume ls -q')
	for(let volume of volumes.toString().split(/\n/)) {
		if(!volume) continue
		else if(volume===container_name) return container_name
		else if(volume===`locked_${container_name}`) return `locked_${container_name}`
	}
	return false
}
