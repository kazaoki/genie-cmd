
/**
 * mysql: MySQL操作
 * -----------------------------------------------------------------------------
 * ex. g mysql
 *     g mysql -f
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const inquirer = require('inquirer')
const color = require('cli-color')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g mysql [Options]')
		.options('cli', {
			describe: 'MySQLコンテナのCLIに入る',
		})
		.options('dump', {
			alias: 'd',
			describe: 'MySQLのダンプを取る',
		})
		.options('restore', {
			alias: 'r',
			describe: 'MySQLのリストアを行う',
		})
		.options('name', {
			alias: 'n',
			describe: '対象のMySQLコンテナ名を直接指定する',
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
			d('CLI')
			let container_name = await get_target_containers(config, argv, {is_single:true})
			d(container_name)
			process.exit()
		}

		// --dump: ダンプを取る
		else if(argv.dump) {
			d('DUMP')
			let container_name = await get_target_containers(config, argv, {has_all:true})
			d(container_name)
			process.exit()
		}

		// --restore: レストアする
		else if(argv.restore) {
			d('RESTORE')
			let container_name = await get_target_containers(config, argv, {has_all:true})
			d(container_name)
			process.exit()
		}

		// mysqlコマンドに入る
		else {
			let container_name = await get_target_containers(config, argv, {is_single:true})
			let key
			for(let tmpkey of Object.keys(config.db.mysql)) {
				if(container_name === `${config.run.base_name}-mysql-${tmpkey}`) {
					key = tmpkey
					break
				}
			}
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
function get_target_containers(config, argv, option={})
{
	// 引数で指定があればそれ
	if(argv.name) {
		return (option.is_single && Array.isArray(argv.name))
			? argv.name[0] // single指定なのに複数引数に書いてある場合は最初のやつ
			: argv.name
	}

	// １つしかなければそれ
	if(Object.keys(config.db.mysql).length===1) {
		return `${config.run.base_name}-mysql-${Object.keys(config.db.mysql)[0]}`
	}

	// ２つ以上あれば選択肢
	return (async ()=>{
		// let running = await lib.existContainers(config, '/'+config.run.base_name+'-mysql')
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
