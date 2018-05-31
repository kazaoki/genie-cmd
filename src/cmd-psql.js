
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

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g psql [Options]')
		.options('cli', {
			describe: 'PostgreSQLコンテナのCLIに入る',
		})
		.options('dump', {
			alias: 'd',
			describe: 'PostgreSQLのダンプを取る',
		})
		.options('restore', {
			alias: 'r',
			describe: 'PostgreSQLのリストアを行う',
		})
		.options('name', {
			alias: 'n',
			describe: '対象のPostgreSQLコンテナ名を直接指定する',
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
		let container_name = await get_target_containers(config, argv, {is_single:true})
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
		d('DUMP')
		let container_name = await get_target_containers(config, argv, {has_all:true})
		d(container_name)
	}

	// --restore: レストアする
	else if(argv.restore) {
		d('RESTORE')
		let container_name = await get_target_containers(config, argv, {has_all:true})
		d(container_name)
	}

	// psqlコマンドに入る
	else {
		let container_name = await get_target_containers(config, argv, {is_single:true})
		let key = get_key_from_container_name(config, container_name)
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
function get_target_containers(config, argv, option={})
{
	// 引数で指定があればそれ
	if(argv.name) {
		return (option.is_single && Array.isArray(argv.name))
			? argv.name[0] // single指定なのに複数引数に書いてある場合は最初のやつ
			: argv.name
	}

	// １つしかなければそれ
	if(Object.keys(config.db.postgresql).length===1) {
		return `${config.base_name}-postgresql-${Object.keys(config.db.postgresql)[0]}`
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
				message: '対象のPostgreSQLコンテナを選択してください。',
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
			for(let key of Object.keys(config.db.postgresql)) {
				containers.push(`${config.base_name}-postgresql-${key}`)
			}
			return containers
		} else {
			let matches = result.container.match(/^(\w+) /)
			return `${config.base_name}-postgresql-${matches[1]}`
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
