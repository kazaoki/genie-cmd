
'use strict'

const fs = require('fs')
const strwidth = require('string-width')
const color = require('cli-color')
const wrap = require('jp-wrap')(color.windowSize.width-8);
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
	let lump = '';
	for(let i=0; i<times; i++) {
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
	let indent = '  ';
	let line_color = color.white;
	let fg_color = color.white;
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
	} else if(type==='whisper') {
		line_color = color.blackBright
		fg_color = color.blackBright
	}

	message = wrap(message.replace(/[\r\n]+$/, ''))
	let messages = message.split(/[\r\n]+/)
	let width = 0;
	for(let i in messages) {
		let len = strwidth(messages[i])
		if(width < len) width = len;
	}
	width += 2;

	console.log(
		indent +
		line_color('┏') +
		line_color(Repeat('─', width)) +
		line_color('┓')
	)
	for(let i in messages) {
		if(line>0 && line==i) {
			console.log(
				indent +
				line_color('┣') +
				line_color(Repeat('─', width)) +
				line_color('┫')
			)
		}
		console.log(
			indent +
			line_color('│') +
			fg_color(' '+messages[i]+' ') +
			Repeat(' ', (width-2) - strwidth(messages[i])) +
			line_color('│')
		)
	}
	console.log(
		indent +
		line_color('┗') +
		line_color(Repeat('─', width)) +
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
	let indent = color.bgBlack('  ');
	message = '  ' + message + '  ';
	let len = strwidth(message) + tail_space;
	let fg = color.whiteBright.bgBlueBright;
	let bg = color.bgBlue;
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

	// ファイルロード
	let config = require(config_js).config;

	// 実行モードをセット
	config.runmode = argv.mode

	// 実行時の定義をセット
	config.run = {}
	{
		// コンテナベース名セット
		config.run.base_name = argv.shadow
			? config.core.docker.name + '-SHADOW'
			: config.core.docker.name

		// プロジェクトルートセット
		config.run.project_dir = getProjectRootDir()

		// シャドウモードかセット
		if(argv.shadow) config.run.shadow = 1
	}

	return config
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
	Say('エラーが発生しました')
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
					args.push('--name', `${config.run.base_name}-postgresql-${keys[i]}`)
					args.push('--label', `genie_project_dir="${config.run.project_dir}"`)
					if(config.run.shadow) args.push('--label', 'genie_shadow')
					args.push('-v', `${config.run.project_dir}/.genie/files/opt/postgresql/:/opt/postgresql/`)
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
					args.push('--name', `${config.run.base_name}-mysql-${keys[i]}`)
					args.push('--label', `genie_project_dir="${config.run.project_dir}"`)
					if(config.run.shadow) args.push('--label', 'genie_shadow')
					args.push('-v', `${config.run.project_dir}/.genie/files/opt/mysql/:/opt/mysql/`)
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
			args.push('-v', config.run.project_dir+'/.genie/files/opt:/opt')
			args.push('--label', `genie_project_dir="${config.run.project_dir}"`)
			if(config.run.shadow) args.push('--label', 'genie_shadow')
			args.push(`--name=${config.run.base_name}`)
			if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
			if(config.core.docker.options) args.push(`${config.core.docker.options}`)
			args.push('--restart=always')

			// Perl関係
			if(config.lang.perl.cpanfile_enabled) args.push('-e', 'PERL5LIB=/perl/cpanfile-modules/lib/perl5')

			// PostgreSQL関係
			if(config.db.postgresql){
				let keys = Object.keys(config.db.postgresql);
				for(let i=0; i<keys.length; i++) {
					let container_name = `${config.run.base_name}-postgresql-${keys[i]}`;
					args.push('--link', container_name)
					args.push('--add-host', config.db.postgresql[keys[i]].host + ':' + getContainerIp(container_name, config))
				}
			}

			// MySQL関係
			if(config.db.mysql){
				let keys = Object.keys(config.db.mysql);
				for(let i=0; i<keys.length; i++) {
					let container_name = `${config.run.base_name}-mysql-${keys[i]}`;
					args.push('--link', container_name)
					args.push('--add-host', config.db.mysql[keys[i]].host + ':' + getContainerIp(container_name, config))
				}
			}

			// SSHD関係
			if(config.trans.sshd){
				args.push('-p', `${config.trans.sshd.external_port}:22`)
			}

			// Apache関係
			if(config.http.apache){
				args.push('-v', `${config.run.project_dir}/${config.http.apache.public_dir}:/var/www/html`)
				if(config.http.apache.external_http_port) {
					args.push('-p', `${config.http.apache.external_http_port}:80`)
				}
				if(config.http.apache.external_https_port) {
					args.push('-p', `${config.http.apache.external_https_port}:443`)
				}
			}

			// Nginx関係
			if(config.http.nginx){
				args.push('-v', `${config.run.project_dir}/${config.http.nginx.public_dir}:/usr/share/nginx/html`)
				if(config.http.nginx.external_http_port) {
					args.push('-p', `${config.http.nginx.external_http_port}:80`)
				}
				if(config.http.nginx.external_https_port) {
					args.push('-p', `${config.http.nginx.external_https_port}:443`)
				}
			}

			// Sendlog関係
			if(config.mail.sendlog.external_port) {
				args.push('-p', `${config.mail.sendlog.external_port}:9981`)
			}

			// Fluentd関係
			if(config.log.fluentd) {
				args.push('-v', `${config.run.project_dir}/.genie/files/opt/td-agent:/etc/td-agent`)
			}

			// 追加ホスト
			if(config.core.docker.hosts && Array.isArray(config.core.docker.hosts) && config.core.docker.hosts.length) {
				for(let i=0; i<config.core.docker.hosts.length; i++){
					args.push(`--add-host=${config.core.docker.hosts[i]}`)
				}
			}

			// 追加マウント
			args.push('-v', `${config.run.project_dir}/:/mnt/host/`)
			if(config.core.docker.volumes && Array.isArray(config.core.docker.volumes) && config.core.docker.volumes.length) {
				for(let i=0; i<config.core.docker.volumes.length; i++){
					if(config.core.docker.volumes[i].match(/^\//)) {
						args.push('-v', `${config.core.docker.volumes[i]}`)
					} else {
						args.push('-v', `${config.run.project_dir}/${config.core.docker.volumes[i]}`)
					}
				}
			}

			// 設定値を環境変数値に
			let envs = {}
			let conv = (data, parent_key)=>{
				if(typeof(data)==='object' && !Array.isArray(data)) {
					// 再帰
					let keys = Object.keys(data)
					for(let i =0; i<keys.length; i++){
						conv(data[keys[i]], `${parent_key}_${keys[i].toUpperCase()}`)
					}
				} else {
					// 変換してセット
					if(typeof(data)==='object' && Array.isArray(data)) {
						envs[parent_key] = JSON.stringify(data)
					} else {
						envs[parent_key] = data
					}
				}

			}
			conv(config, 'GENIE')
			envs.GENIE_RUNMODE=config.runmode;
			let keys = Object.keys(envs)
			for(let i=0; i<keys.length; i++) {
				args.push('-e', `${keys[i]}=${envs[keys[i]]}`)
			}

			// イメージ指定
			args.push(config.core.docker.image)

			d(args.join(' '))

			// dockerコマンド実行
			let result = child.spawnSync('docker', args)
			if(result.stderr.toString()) {
				reject(result.stderr.toString())
			} else {
				resolve();
			}

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
		`label=genie_project_dir="${config.run.project_dir}"`,
	]
	if(config.run.shadow) {
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
			return result.stdout.toString().replace(/[\r\n]$/, '')
		}
	} catch(err) {
		Error(err)
	}
}
