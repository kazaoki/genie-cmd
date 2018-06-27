
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
		// .options('name', {
		// 	alias: 'n',
		// 	describe: '対象のMySQLコンテナ名を直接指定する',
		// })
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
		if(!fs.existsSync(dump_dir)) fs.mkdirSync(dump_dir, 0o755)

		// キーごとに回す
		for(let key of keys)
		{
			// キー名チェック
			if(!config.db.mysql[key]) lib.Error('指定のキーのMySQL設定が定義されていません。'+key)

			// ダンプファイルローテーション
			if(!argv.n) {
				let dump_file = `${dump_dir}/${key}.sql`
				if(fs.existsSync(dump_file)) {
					await new Promise((resolve, reject)=>{
						rotate(dump_file, { count: config.db.mysql[key].dump_genel+1 }, err=>{
							err
								? reject(err)
								: resolve()
						});
					})
				}
			}

			// ダンプ実行
			let mysql = config.db.mysql[key]
			let args = [
				'exec',
				`${config.base_name}-mysql-${key}`,
				'sh',
				'-c',
				`"mysqldump --single-transaction -u${mysql.user} -p${mysql.pass} ${mysql.name} > /opt/mysql/dumps/${key}.sql"`,
			]
			let result = child.execSync('docker '+args.join(' '))
			if(result.status) lib.Error(result.stderr.toString())
		}
	}

	// --restore: リストアする
	else if(argv.restore) {
		d('RESTORE')
		let container_name = await get_target_containers(config, {has_all:true}, 'リストアするMySQLコンテナを選択してください。')
		d(container_name)
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
