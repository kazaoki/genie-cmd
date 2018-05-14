
/**
 * mysql: MySQL操作
 * -----------------------------------------------------------------------------
 * ex. g mysql
 *     g mysql container1
 *     g mysql --cli
 *     g mysql --cli container1
 *     g mysql --dump
 *     g mysql --dump container1 container2
 *     g mysql --restore
 *     g mysql --restore container1 container2
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const inquirer = require('inquirer')
const fs = require('fs')

module.exports = option=>{

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
			describe: '管轄全てのMySQLを対象とする（--dump, --restoreのみ）',
			boolean: true,
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 設定
	let config = lib.loadConfig(argv);
	if(!(config.db.mysql && Object.keys(config.db.mysql).length)) {
		lib.Error('MySQL設定がありません。')
	}

	// dockerが起動しているか
	if(!lib.existContainers(config, '/'+config.run.base_name+'$')) {
		lib.Error('dockerコンテナが起動していません: '+config.run.base_name)
	}

	(async()=>{

		// --cli: MySQLコンテナの中に入る
		if(argv.cli) {
			let container_name = argv._[1]
				? `${config.run.base_name}-mysql-${argv._[1]}`
				: await get_target_containers(config, {is_single:true})
			let key = get_key_from_container_name(config, container_name)
			child.spawnSync('docker', [
				'exec',
				'-it',
				container_name,
				'bash',
			],
				{stdio: 'inherit'}
			)
			process.exit()
		}

		// --dump: ダンプを取る
		else if(argv.dump) {
			// 対象のコンテナを特定
			argv._.shift()
			let container_names = argv.all
				? Object.keys(config.db.mysql).map(key=>`${config.run.base_name}-mysql-${key}`)
				: argv._.length
					? argv._.map(key=>`${config.run.base_name}-mysql-${key}`)
					: await get_target_containers(config, {has_all:true})
			// d(container_names)

			// 設定ごとに回す
			for(let container_name of container_names)
			{
				// ダンプを保存するディレクトリが無ければ作成する
				let dump_dir = '/opt/mysql/dumps'
				let cmd = `docker exec ${container_name} mkdir -p ${dump_dir}`;
				child.execSync(cmd)
				// d(cmd)

				//

			}

			process.exit()


		}

		// --restore: リストアする
		else if(argv.restore) {
			d('RESTORE')
			let container_name = await get_target_containers(config, {has_all:true})
			d(container_name)
			process.exit()
		}

		// mysqlコマンドに入る
		else {
			if(!config.db.mysql[argv._[1]]) lib.Error('指定のキーのMySQL設定が定義されていません。'+argv._[1])
			let container_name = argv._[1]
				? `${config.run.base_name}-mysql-${argv._[1]}`
				: await get_target_containers(config, {is_single:true})
			let key = get_key_from_container_name(config, container_name)
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
			process.exit()
		}

	})()
}

/**
 * コンテナを選択させる
 */
function get_target_containers(config, option={})
{
	// １つしかなければそれ
	if(Object.keys(config.db.mysql).length===1) {
		return `${config.run.base_name}-mysql-${Object.keys(config.db.mysql)[0]}`
	}

	// ２つ以上あれば選択肢
	return (async ()=>{
		let key
		let container_name

		// 選択肢用意
		let list = []
		for(let name of Object.keys(config.db.mysql)) {
			list.push(`${name} (${config.run.base_name}-mysql-${name})`)
		}

		// 選択開始
		if(option.has_all) list.push('全て')
		console.log()
		let result = await inquirer.prompt([
			{
				type: 'list',
				message: '対象のMySQLコンテナを選択してください。',
				name: 'container',
				pageSize: 100,
				choices: list
			}
		]).catch(err=>{
			lib.Error(err)
		})

		// 選択肢返却
		if(result.container==='全て') {
			let containers = []
			for(let key of Object.keys(config.db.mysql)) {
				containers.push(`${config.run.base_name}-mysql-${key}`)
			}
			return containers
		} else {
			let matches = result.container.match(/^(\w+) /)
			return `${config.run.base_name}-mysql-${matches[1]}`
		}

	})()
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key
	for(let tmpkey of Object.keys(config.db.mysql)) {
		if(container_name === `${config.run.base_name}-mysql-${tmpkey}`) {
			key = tmpkey
			break
		}
	}
	return key
}
