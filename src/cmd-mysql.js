
/**
 * mysql: MySQL操作
 * -----------------------------------------------------------------------------
 * ex. g mysql
 *     g mysql container1
 *     g mysql --cli
 *     g mysql --cli container1
 *     g mysql --dump
 *     g mysql --dump container1 container2
 *     g mysql --dump --all
 *     g mysql --dump --no-rotate
 *     g mysql -dan
 *     g mysql -d main -o C:\dumps
 *     g mysql --restore
 *     g mysql --restore container1 container2
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
		.usage('Usage: genie|g mysql [Options]')
		.options('cli', {
			alias: 'c',
			describe: 'MySQLコンテナのCLIに入る',
			boolean: true,
		})
		.options('dump', {
			alias: 'd',
			describe: 'MySQLのダンプを取る',
			boolean: true,
		})
		.options('restore', {
			alias: 'r',
			describe: 'MySQLのリストアを行う',
			boolean: true,
		})
		.options('all', {
			alias: 'a',
			describe: '管轄全てのMySQLを対象とする。（--dump, --restore時のみ）',
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
	if(!(config.db.mysql && Object.keys(config.db.mysql).length)) {
		lib.Error('MySQL設定がありません。')
	}

	// dockerが起動しているか
	if(!lib.existContainers(config, '/'+config.base_name+'$')) {
		lib.Error('dockerコンテナが起動していません: '+config.base_name)
	}

	// --cli: MySQLコンテナの中に入る
	if(argv.cli) {
		let container_name = argv._[1]
			? `${config.base_name}-mysql-${argv._[1]}`
			: await get_target_containers(config, {is_single:true}, 'コマンドラインに入るMySQLコンテナを選択してください。')
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
			? Object.keys(config.db.mysql)
			: argv._.length
				? argv._
				: await get_target_containers(config, {has_all:true, is_key_return:true}, 'ダンプを取るMySQLコンテナを選択してください。')
		if(!Array.isArray(keys)) keys = [keys]


		// ダンプを保存するディレクトリが無ければ作成する
		let dump_dir = `${config.root}/.genie/files/opt/mysql/dumps`
		if(argv.o) dump_dir = argv.o.replace(/\/$/, '')
		if(!fs.existsSync(dump_dir)) fs.mkdirSync(dump_dir, 0o755)

		// キーごとに回す
		let funcs = [];
		for(let key of keys){
			let container_name = `${config.base_name}-mysql-${key}`
			funcs.push({
				label: container_name,
				proc: 'dumping',
				ok: 'dumped!',
				ng: 'failed!',
				func: new Promise(async (ok, ng)=>
				{
					// キー名チェック
					if(!config.db.mysql[key]) ng('指定のキーのMySQL設定が定義されていません。'+key)
					let mysql = config.db.mysql[key]

					// ダンプファイルローテーション
					if(!argv.n) {
						let dump_file = `${dump_dir}/${key}.sql${argv.g?'.gz':''}`
						if(fs.existsSync(dump_file)) {
							await new Promise((resolve, reject)=>{
								rotate(dump_file, { count: mysql.dump_genel+1 }, err=>{
									err
										? reject(err)
										: resolve()
								})
							})
						}
					}

					// ダンプ用コンテナを起動する
					let run_docker =
						'docker run -d'+
						` --name ${container_name}-dumper`+
						' -e MYSQL_ROOT_PASSWORD=1'+
						` --link ${container_name}`+
						` -v ${dump_dir}:/dumps/`+
						(config.core.docker.network ? ` --net=${config.core.docker.network}` : '')+
						(config.core.docker.options ? ` ${config.core.docker.options}` : '')+
						` ${mysql.repository}`+
						' mysqld'+
						(mysql.charset ? ` --character-set-server=${mysql.charset}` : '')+
						(mysql.collation ? ` --collation-server=${mysql.collation}` : '')
					;
					child.execSync(run_docker)

					// ダンプ実行
					let exec_dump =
						'docker exec'+
						` ${container_name}-dumper`+
						' sh -c'+
						` "mysqldump --single-transaction -h ${container_name} -u${mysql.user} -p${mysql.pass} ${mysql.name} > /dumps/${key}.sql${argv.g?'.gz':''}"`
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
			? Object.keys(config.db.mysql)
			: argv._.length
				? argv._
				: await get_target_containers(config, {has_all:true, is_key_return:true}, 'リストアするMySQLコンテナを選択してください。')
		if(!Array.isArray(keys)) keys = [keys]

		// リストア実行
		let funcs = [];
		for(let key of keys) {
			let container_name = `${config.base_name}-mysql-${key}`
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
						child.exec(`docker rm -f -v ${container_name}`, (error, stdout, stderr)=>{
							error && ng(error)

							// ボリュームも消す（上記の-v指定で消えはずなのに消えないので・・）
							child.exec(`docker volume rm -f ${volume_container_name}`, (error, stdout, stderr)=>{

								// 新たにコンテナを立ち上げる
								child.exec(reloader, (error, stdout, stderr)=>{
									error && ng(error)

									// コンテナ直下に起動用コマンドを記録する（restore用）
									child.exec(`docker exec ${container_name} sh -c "echo '${reloader}' > /docker-run.cmd"`, (error, stdout, stderr)=>{
										error && ng(error)

										// 特定の文字がログに出てくるまで待機
										let waiter = ()=>{
											let log = child.execSync(`docker logs ${container_name}`)
											if(log.toString().match(/MySQL init process done\. Ready for start up\./)) {
												ok()
											} else {
												setTimeout(waiter, 100)
											}
										}
										setTimeout(waiter, 100)
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

	// mysqlコマンドに入る
	else {
		let container_name = argv._[1]
			? `${config.base_name}-mysql-${argv._[1]}`
			: await get_target_containers(config, {is_single:true}, 'mysqlコマンドラインに入るMySQLコンテナを選択してください。')
		let key = get_key_from_container_name(config, container_name)
		if(!config.db.mysql[key]) lib.Error('指定のキーのMySQL設定が定義されていません。'+argv._[1])
		child.spawnSync('docker', [
			'exec',
			'-it',
			container_name,
			'mysql',
			config.db.mysql[key].name,
			`-u${config.db.mysql[key].user}`,
			`-p${config.db.mysql[key].pass}`,
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
	if(Object.keys(config.db.mysql).length===1) {
		return `${config.base_name}-mysql-${Object.keys(config.db.mysql)[0]}`
	}

	// ２つ以上あれば選択肢
	return (async ()=>{
		let key
		let container_name

		// 選択肢用意
		let list = []
		for(let name of Object.keys(config.db.mysql)) {
			list.push(`${name} (${config.base_name}-mysql-${name})`)
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
				? Object.keys(config.db.mysql)
				: Object.keys(config.db.mysql).map(key=>`${config.base_name}-mysql-${key}`)
		} else {
			let matches = result.container.match(/^(\w+) /)
			return option.is_key_return
				? matches[1]
				: `${config.base_name}-mysql-${matches[1]}`
		}

	})()
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key
	for(let tmpkey of Object.keys(config.db.mysql)) {
		if(container_name === `${config.base_name}-mysql-${tmpkey}`) {
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
