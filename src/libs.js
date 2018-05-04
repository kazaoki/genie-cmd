
'use strict'

const fs = require('fs')
const strwidth = require('string-width')
const color = require('cli-color')
const readline = require('readline').createInterface(process.stdin, process.stdout)
const child = require('child_process')
const path = require('path')
const util = require('util');

/**
 * d
 * -----------------------------------------------------------------------------
 * @param {object} ダンプ表示するデータオブジェクト
 */
const d = module.exports.d = data=>console.log(util.inspect(data, {colors: true, compact: false, breakLength: 10, depth: 10}))

/**
 * h
 * -----------------------------------------------------------------------------
 * @param {string} 見出し文字列
 * @param {function} cli-colorメソッド
 */
const h = module.exports.h = (title, clc=color.white)=>console.log('\n  '+clc(title))

/**
 * プロジェクトルートパスを返す（.genie/ がある直近の親ディレクトリを返す）
 * -----------------------------------------------------------------------------
 * @return {string} プロジェクトルートパス。失敗した場合はfalse
 */
const getProjectRootDir = module.exports.getProjectRootDir = ()=>{
	let root_dir = ''
	let check_dir = __dirname
	let cont = true
	do {
		try {
			fs.accessSync(check_dir + '/.genie')
			root_dir = check_dir
		} catch(err) {
			let temp = check_dir;
			check_dir = path.dirname(check_dir);
			if(temp===check_dir) cont = false
		}
	} while(root_dir==='' && cont)
	if(root_dir) {
		return root_dir
	} else {
		Error('先祖ディレクトリに .genie/ が見つかりませんでした。\n`genie init` などして初期化してください。')
	}
}

/**
 * Repeat
 * -----------------------------------------------------------------------------
 * @param {string} string 繰り返したい文字
 * @param {number} times 繰り返したい回数
 * @return {string} 繰り返した文字列
 */
const Repeat = module.exports.Repeat = (string, times=1)=>{
	if(!times>0) return '';
	var lump = '';
	for(var i=0; i<times; i++) {
		lump += string;
	}
	return lump;
}

/**
 * Message
 * -----------------------------------------------------------------------------
 * @param {string} message 表示したいメッセージ。改行込み複数行対応。
 * @param {string} type タイプ。primary|success|danger|warning|info|default
 * @param {number} line タイトル線を引く位置。
 */
const Message = module.exports.Message = (message, type='default', line=0)=>{
	var indent = '  ';
	var line_color = color.white;
	var fg_color = color.white;
	message = message.replace(/[\r\n]+$/, '');
	if(type==='primary') {
		line_color = color.xterm(26)
		fg_color = color.xterm(39)
	} else if(type==='success') {
		line_color = color.green
		fg_color = color.greenBright
	} else if(type==='danger') {
		line_color = color.red
		fg_color = color.redBright
	} else if(type==='warning') {
		line_color = color.yellow
		fg_color = color.yellowBright
	} else if(type==='info') {
		line_color = color.whiteBright
		fg_color = color.whiteBright
	}

	var messages = message.split(/[\r\n]+/)
	var length = 0;
	for(var i in messages) {
		var len = strwidth(messages[i])
		if(length < len) length = len;
	}
	length += 2;

	console.log(
		indent +
		line_color('┏') +
		line_color(Repeat('─', length)) +
		line_color('┓')
	)
	for(var i in messages) {
		if(line>0 && line==i) {
			console.log(
				indent +
				line_color('┣') +
				line_color(Repeat('─', length)) +
				line_color('┫')
			)
		}
		console.log(
			indent +
			line_color('│') +
			fg_color(' '+messages[i]+' ') +
			Repeat(' ', (length-2) - strwidth(messages[i])) +
			line_color('│')
		)
	}
	console.log(
		indent +
		line_color('┗') +
		line_color(Repeat('─', length)) +
		line_color('┛')
	)
}

/**
 * Messages
 * -----------------------------------------------------------------------------
 * @param {objext} 複数メッセージを一挙に出力
 */
const Messages = module.exports.Messages = (messages)=>{
	if(!Array.isArray(messages)) messages = [messages]
	for(let i in messages) {
		for(let key in messages[i]) {
			Message(messages[i][key], key)
		}
	}
}

/**
 * Input
 * -----------------------------------------------------------------------------
 * @param {string} message 入力を促す表示メッセージ
 * @param {number} tail_space 背景BOXの長さを追加する文字数
 * @return {string} 入力値
 */
const Input = module.exports.Input = (message, tail_space=20)=>{
	var indent = color.bgBlack('  ');
	message = '  ' + message + '  ';
	var len = strwidth(message) + tail_space;
	var fg = color.whiteBright.bgBlueBright;
	var bg = color.bgBlue;
	console.log(
		'\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + fg(message + Repeat(' ', tail_space))  + '\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + bg(Repeat(' ', len))
	);
	process.stdout.write(color.move.up(3));
	process.stdout.write(color.move.right(len - tail_space));
	return new Promise (
		(result) => {
			readline.on('line', (input)=>{
				process.stdout.write(color.move.down(3));
				result(input)
			})
		}
	);
}

/**
 * Say
 * -----------------------------------------------------------------------------
 * @param {string} message スピーチする文字列
 */
const Say = module.exports.Say = message=>{
	if(message.length===0) return;
	// Macの場合はsayコマンド
	if(isMac()) {
		child.execSync(`say -r 300 "${message}"`)
	}
	// Windowsの場合はwscriptスクリプトをtempに用意してから実行（最後は削除する）
	else if(isWindows()) {
		let temp_dir = fs.mkdtempSync(process.env.TEMP+'/genie-say-')
		let temp_file = temp_dir+'/say.js'
		fs.writeFileSync(temp_file, `var args = [];for(var i = 0; i < WScript.Arguments.length; i++) args.push(WScript.Arguments.Item(i));WScript.CreateObject('SAPI.SpVoice').Speak('<volume level="100">'+'<rate speed="2">'+'<pitch middle="0">'+args.join(' ')+'</pitch>'+'</rate>'+'</volume>', 8);`)
		child.execSync(`start wscript ${temp_file} "${message}"`)
		fs.unlinkSync(temp_file)
		fs.rmdirSync(temp_dir)
	}
}

/**
 * loadConfig
 * -----------------------------------------------------------------------------
 * @param {object} argv コマンド引数
 */
const loadConfig = module.exports.loadConfig = argv=>{

	// プロジェクトルートパス取得
	let root_dir = getProjectRootDir();
	let config_js = `${root_dir}/.genie/${argv.config}`;
	try {
		fs.accessSync(config_js)
	} catch (err){
		Error(`設定ファイル（.genie/${argv.config}）が見つかりませんでした。`)
	}
	return require(config_js).genie
}

/**
 * isWindows
 * -----------------------------------------------------------------------------
 * @return {boolean} Windowsかどうか
 */
const isWindows = module.exports.isWindows = ()=>{return process.platform === 'win32'}

/**
 * isMac
 * -----------------------------------------------------------------------------
 * @return {boolean} MacOSかどうか
 */
const isMac = module.exports.isMac = ()=>{return process.platform === 'darwin'}

/**
 * hasDockerMachineEnv
 * -----------------------------------------------------------------------------
 * @return {boolean} DockerMachine環境があるかどうか
 */
const hasDockerMachineEnv = module.exports.hasDockerMachineEnv = ()=>{
	let result = child.spawnSync('docker-machine')
	return result.status===0
}

/**
 * Error
 * -----------------------------------------------------------------------------
 * @param {string} エラーメッセージ
 */
const Error = module.exports.Error = (message)=>{
	console.log()
	Message(`エラーが発生しました。\n${message}`, 'danger', 1)
	process.exit()
}

/**
 * dockerDown
 * -----------------------------------------------------------------------------
 * @param {string} コンテナタイプ：genie|postgresql|mysql
 * @param {object} config
 */
const dockerDown = module.exports.dockerDown = (name_filter, config)=>{
	return new Promise((resolve, reject)=>{
		let containers = existContainers(config, name_filter);
		let delfuncs = [];
		for(let i=0; i<containers.length; i++){
			delfuncs.push(
				new Promise((ok,ng)=>{
					process.stdout.write(color.blackBright(`  ${containers[i].name} (${containers[i].id}) ...`))
					let result = child.spawnSync('docker', ['rm', '-f', containers[i].id])
					if(result.stderr.toString()){
						process.stdout.write(color.red(' delete NG!\n'))
						ng(result.stderr.toString())
					} else {
						process.stdout.write(color.green(' deleted.\n'))
						ok()
					}
				})
			)
		}
		(async()=>{
			await Promise.all(delfuncs).catch(err=>err)
		})()
		resolve()
	})
}

/**
 * dockerUp
 * -----------------------------------------------------------------------------
 * @param {string} type コンテナタイプ：genie|postgresql|mysql
 * @param {object} config 設定データ
 */
const dockerUp = module.exports.dockerUp = (type, config)=>{

	// d([type, config.up])

	// PostgreSQLを起動
	if(type==='postgresql') {
		return new Promise((resolve, reject)=>{
			try {
				let keys = Object.keys(config.db.postgresql);
				for(let i=0; i<keys.length; i++) {
					let postgresql = config.db.postgresql[keys[i]]

					// 引数用意
					let args = [];
					args.push('run', '-d', '-it')
					args.push('-e', 'TERM=xterm')
					args.push('--name', `${config.up.base_name}-postgresql-${keys[i]}`)
					args.push('--label', `genie_project_dir="${config.up.label.genie_project_dir}"`)
					if(config.up.label.genie_shadow) args.push('--label', 'genie_shadow')
					args.push('-v', `${config.up.label.genie_project_dir}/.genie/root/opt/postgresql/:/opt/postgresql/`)
					args.push('-e', `POSTGRES_LABEL=${keys[i]}`)
					args.push('-e', `POSTGRES_HOST=${postgresql.host}`)
					args.push('-e', `POSTGRES_DB=${postgresql.name}`)
					args.push('-e', `POSTGRES_USER=${postgresql.user}`)
					args.push('-e', `POSTGRES_PASSWORD=${postgresql.pass}`)
					args.push('-e', `POSTGERS_ENCODING=${postgresql.encoding}`)
					args.push('-e', `POSTGERS_LOCALE=${postgresql.locale}`)
					if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
					if(config.core.docker.options) args.push(`${config.core.docker.options}`)
					if(postgresql.external_port) args.push('-p', `${postgresql.external_port}:5432`)
					args.push('--entrypoint=/opt/postgresql/before-entrypoint.sh')
					args.push('--restart=always')
					args.push(postgresql.repository)
					args.push('postgres')

					// dockerコマンド実行
					let result = child.spawnSync('docker', args)
					if(result.stderr.toString()) {
						reject(result.stderr.toString())
					} else {
						resolve();
					}
				}
				resolve()
			} catch(err) {
				reject(err)
			}
		})
	}

	// MySQLを起動
	else if(type==='mysql') {
		return new Promise((resolve, reject)=>{
			try {
				let keys = Object.keys(config.db.mysql);
				for(let i=0; i<keys.length; i++) {
					let mysql = config.db.mysql[keys[i]]

					// 引数用意
					let args = [];
					args.push('run', '-d', '-it')
					args.push('-e', 'TERM=xterm')
					args.push('--name', `${config.up.base_name}-mysql-${keys[i]}`)
					args.push('--label', `genie_project_dir="${config.up.label.genie_project_dir}"`)
					if(config.up.label.genie_shadow) args.push('--label', 'genie_shadow')
					args.push('-v', `${config.up.label.genie_project_dir}/.genie/root/opt/mysql/:/opt/mysql/`)
					args.push('-e', `MYSQL_LABEL=${keys[i]}`)
					args.push('-e', `MYSQL_ROOT_PASSWORD=${mysql.pass}`)
					args.push('-e', `MYSQL_DATABASE=${mysql.name}`)
					args.push('-e', `MYSQL_USER=${mysql.user}`)
					args.push('-e', `MYSQL_PASSWORD=${mysql.pass}`)
					args.push('-e', `MYSQL_CHARSET=${mysql.charset}`)
					if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
					if(config.core.docker.options) args.push(`${config.core.docker.options}`)
					if(mysql.external_port) args.push('-p', `${mysql.external_port}:3306`)
					args.push('--entrypoint=/opt/mysql/before-entrypoint.sh')
					args.push('--restart=always')
					args.push(mysql.repository)
					args.push('mysqld')
					if(mysql.charset) args.push(`--character-set-server=${mysql.charset}`)
					if(mysql.collation) args.push(`--collation-server=${mysql.collation}`)

					// dockerコマンド実行
					let result = child.spawnSync('docker', args)
					if(result.stderr.toString()) {
						reject(result.stderr.toString())
					} else {
						resolve();
					}
				}
				resolve()
			} catch(err) {
				reject(err)
			}
		})
	}

	// genie本体を起動
	else if(type==='genie') {
		return new Promise((resolve, reject)=>{
			// 基本引数
			let args = [];
			args.push('run', '-d', '-it')
			args.push('-e', 'TERM=xterm')
			args.push('-e', 'LANG=ja_JP.UTF-8')
			args.push('-e', 'LC_ALL=ja_JP.UTF-8')
			args.push('-v', config.up.label.genie_project_dir+'/.genie/root/opt:/opt')
			args.push('--label', `genie_project_dir="${config.up.label.genie_project_dir}"`)
			if(config.up.label.genie_shadow) args.push('--label', 'genie_shadow')

			// Perl関係
			if(config.lang.perl.cpanfile_enabled) args.push('-e', 'PERL5LIB=/perl/cpanfile-modules/lib/perl5')

			// MySQL関係
			try {
				let keys = Object.keys(config.db.mysql);
				for(let i=0; i<keys.length; i++) {
					let container_name = `${config.up.base_name}-mysql-${keys[i]}`;
					args.push('--link', container_name)
					args.push('--add-host', config.db.mysql[keys[i]].host + ':' + getContainerIp(container_name, config))
					// このへんから。（IPとれてる？

				}
			} catch(e){}



// d(config.up)
d(args)

			// dockerコマンド実行



			resolve()
		})
	}
}

/**
 * existContainers
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 * @param {string} name_filter dockerの--filter引数渡す`name=`以降の値。無ければ genie_project_dir と genie_shadow のラベルのみフィルター対象になる
 */
const existContainers = module.exports.existContainers = (config, name_filter)=>{
	let filters = [
		'--filter',
		`label=genie_project_dir="${config.up.label.genie_project_dir}"`,
	]
	if(config.up.label.genie_shadow) {
		filters.push(
			'--filter',
			`label=genie_shadow`,
		)
	}
	if(name_filter) filters.push('--filter', `name=${name_filter}`)
	let result = child.spawnSync('docker', ['ps', '-a', '--format', '{{.ID}}\t{{.Names}}', ...filters])
	let conts = result.stdout.toString().split(/\n/);
	let cont_ids = [];
	for(let i=0; i<conts.length; i++){
		let colums = conts[i].split(/\s+/)
		if(colums[0]) {
			cont_ids.push({
				id:   colums[0],
				name: colums[1],
			})
		}
	}
	return cont_ids.length ? cont_ids : false
}

// /**
//  * exist_volumes
//  * -----------------------------------------------------------------------------
//  * @param {array} filters
//  */
// const exist_volumes = module.exports.exist_volumes = (type, config)=>{

// }

/**
 * getContainerIp
 * -----------------------------------------------------------------------------
 * @param {string} container_name コンテナ名
 */
const getContainerIp = module.exports.getContainerIp = (container_name, config)=>{
	try {
		let result;
		if(config.core.docker.network) {
			result = child.spawnSync('docker', [
				'inspect',
				`--format={{.NetworkSettings.Networks.${config.core.docker.network}.IPAddress}}`,
				container_name
			])
		} else {
			result = child.spawnSync('docker', [
				'inspect',
				`--format={{.NetworkSettings.IPAddress}}`,
				container_name
			])
		}
		if(result.stderr.toString()) {
			Error(result.stderr.toString());
		} else {
			result.stdout.toString()
		}
	} catch(err) {
		Error(err)
	}
}
