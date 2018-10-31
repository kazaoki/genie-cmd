
'use strict'

const fs = require('fs')
const strwidth = require('string-width')
const color = require('cli-color')
const wrap = require('jp-wrap')(color.windowSize.width-8);
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
 * ルートパスを返す（.genie/ がある直近の親ディレクトリを返す）
 * -----------------------------------------------------------------------------
 * @return {string} ルートパス。失敗した場合はfalse
 */
const getRootDir = module.exports.getRootDir = ()=>{
	let root_dir = ''
	let check_dir = process.cwd()
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
	const readline = require('readline').createInterface(process.stdin, process.stdout)

	let indent = color.bgBlack('  ');
	message = '  ' + message + '  ';
	let len = strwidth(message) + tail_space;
	let fg = color.whiteBright.bgBlueBright;
	let bg = color.bgBlue;
	process.stdout.write(
		'\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + fg(message + Repeat(' ', tail_space))  + '\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + bg(Repeat(' ', len)) + '\n'
	);
	process.stdout.write(color.move.up(3));
	process.stdout.write(color.move.right(len - tail_space));
	return new Promise (
		(result) => {
			readline.on('line', (input)=>{
				process.stdout.write(color.move.down(3));
				readline.close()
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
 * showRunmode
 * -----------------------------------------------------------------------------
 */
const showRunmode = module.exports.showRunmode = message=>{
	console.log(color.blackBright(`<${process.env.GENIE_RUNMODE}>`))
}

/**
 * loadConfig
 * -----------------------------------------------------------------------------
 * @param {object} argv コマンド引数
 */
const loadConfig = module.exports.loadConfig = argv=>{

	// ルートパス取得
	let root_dir = getRootDir()
	let config_js = path.join(root_dir, '.genie', argv.config)
	try {
		fs.accessSync(config_js)
	} catch (err){
		Error(`設定ファイル（.genie/${argv.config}）が見つかりませんでした。`)
	}

	// ファイルロード
	try {delete require.cache[require.resolve(config_js)]}catch(e){}
	let config = require(config_js).config;

	// 実行モードをセット
	config.runmode = argv.mode

	// ルートセット
	config.root = root_dir

	// test時の基本調整
	if(config.runmode==='test') {
		config.core.docker.name += '-TEST'
		config.core.docker.mount_mode = 'copy'
		config.core.docker.down_with_volumes = true
		config.core.memo = undefined
		config.lang.php.error_report = false
		config.log.fluentd = undefined
		config.http.browser.at_upped = undefined
		config.http.apache.external_http_port = 'auto'
		config.http.apache.external_https_port = 'auto'
		config.mail.postfix.enabled = false
		config.mail.maildev.external_port = undefined
		if(config.db.mysql) {
			for(let key of Object.keys(config.db.mysql)) {
				config.db.mysql[key].external_port = undefined
			}
		}
		if(config.db.postgresql) {
			for(let key of Object.keys(config.db.postgresql)) {
				config.db.postgresql[key].external_port = undefined
			}
		}
	}

	// 追加の設定（config-[ランモード].js）があればロード
	let paths = path.parse(config_js);
	let add_config_js
	if(path.isAbsolute(config_js)) {
		add_config_js = `${paths.dir}/${paths.name}-${config.runmode}${paths.ext}`;
	} else {
		add_config_js = `${root_dir}/.genie/${paths.dir}/${paths.name}-${config.runmode}${paths.ext}`;
	}

	try {
		fs.accessSync(add_config_js)
		eval(fs.readFileSync(add_config_js).toString())
	} catch (err) {}

	// コンテナベース名セット
	config.base_name = config.core.docker.name

	// config.jsでDockerMachine名が未指定でも環境変数に入っていればセット
	if(!config.core.docker.machine && process.env.DOCKER_MACHINE_NAME) {
		config.core.docker.machine = process.env.DOCKER_MACHINE_NAME
	}

	// ブラウザから見る用のホストIPを取得しておく
	if(config.core.docker.ip_force) {
		config.host_ip = config.core.docker.ip_force
	} else if(hasDockerMachineEnv() && config.core.docker.machine){
		let result = child.spawnSync('docker-machine', ['ip', config.core.docker.machine])
		if(result.status) Error(result.stderr.toString())
		config.host_ip = result.stdout.toString().trim()
	} else {
		config.host_ip = 'localhost'
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
const dockerDown = module.exports.dockerDown = (config, wz_volumes)=>{
	return new Promise((resolve, reject)=>{
		let containers = existContainers(config);
		if(!containers) resolve()
		let delfuncs = [];
		for(let container of containers){
			delfuncs.push(
				new Promise((ok,ng)=>{
					child.spawn('docker', ['rm', '-f', '-v', container.id])
						.stderr.on('data', data=>{
							console.log(
								color.blackBright(`  [Container] ${container.name} (${container.id}) ... `)+
								color.red('delete NG!')
							)
							ng(data)
						})
						.on('close', code=>{
							console.log(
								color.blackBright(`  [Container] ${container.name} (${container.id}) ... `)+
								color.green('deleted')
							)
							ok()
						})
				})
			)
		}
		Promise.all(delfuncs)
			.catch(err=>{Error(err)})
			.then(()=>{
				if(config.core.docker.down_with_volumes || wz_volumes) {
					// 関連ボリューム削除
					let delfuncs = [];
					let regex = new RegExp(`^(locked_)?${config.base_name}`);
					let result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}'])
					if(result.status) Error(result.stderr.toString())
					for(let volume_name of result.stdout.toString().trim().split(/\n/)) {
						if(volume_name.match(regex)) {
							delfuncs.push(
								new Promise((ok,ng)=>{
									child.spawn('docker', ['volume', 'rm', '-f', volume_name])
										.stderr.on('data', data=>{
											console.log(
												color.blackBright(`  [Volume] ${volume_name} ... `)+
												color.red('delete NG!')
											)
											ng(data)
										})
										.on('close', code=>{
											console.log(
												color.blackBright(`  [Volume] ${volume_name} ... `)+
												color.green('deleted')
											)
											ok()
										})
								})
							)
						}
					}
					Promise.all(delfuncs)
						.catch(err=>{Error(err)})
						.then(()=>{resolve()})
				} else {
					resolve()
				}
			})
	})
}

/**
 * dockerUpMySQL
 * -----------------------------------------------------------------------------
 * @param {key} key 設定キー名（main等）
 * @param {object} config 設定データ
 */
const dockerUpMySQL = module.exports.dockerUpMySQL = (key, config)=>
{
	return new Promise((resolve, reject)=>{

		// 引数用意
		let mysql = config.db.mysql[key]
		let container_name = `${config.base_name}-mysql-${key}`
		let args = [];
		args.push('run', '-d', '-it')
		args.push('-e', 'TERM=xterm-256color')
		args.push('--name', container_name)
		args.push('--label', `genie_runmode="${config.runmode}"`)
		args.push('--label', `genie_root="${config.root}"`)
		args.push('-v', `${config.root}/.genie/files/opt/mysql/:/opt/mysql/`)
		args.push('-v', `${mysql.volume_lock ? 'locked_': ''}${container_name}:/var/lib/mysql`)
		args.push('-e', `MYSQL_LABEL=${key}`)
		args.push('-e', `MYSQL_ROOT_PASSWORD=${mysql.pass}`)
		args.push('-e', `MYSQL_DATABASE=${mysql.name}`)
		args.push('-e', `MYSQL_USER=${mysql.user}`)
		args.push('-e', `MYSQL_PASSWORD=${mysql.pass}`)
		args.push('-e', `MYSQL_CHARSET=${mysql.charset}`)
		if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
		if(config.core.docker.options) args.push(`${config.core.docker.options}`)
		if(mysql.external_port) {
			args.push('-p',
				mysql.external_port==='auto'
					? '3306'
					: `${mysql.external_port}:3306`
			)
		}
		args.push('--entrypoint=/opt/mysql/before-entrypoint.sh')
		args.push('--restart=always')
		args.push(mysql.repository)
		args.push('mysqld')
		if(mysql.charset) args.push(`--character-set-server=${mysql.charset}`)
		if(mysql.collation) args.push(`--collation-server=${mysql.collation}`)

		// dockerコマンド実行
		child.spawn('docker', args)
			.stderr.on('data', data=>{
				if(data.toString().match(/Unable to find image '.+' locally/)) {
					process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`] = true
				}
			})
			.on('close', code=>{
				delete process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]

				// コンテナ直下に起動用コマンドを記録する（restore用）
				child.exec(`docker exec ${container_name} sh -c "echo 'docker ${args.join(' ')}' > /docker-run.cmd"`)

				// コマンド終了（でも裏で起動処理は続いている）
				resolve()

			})

	})
}

/**
 * dockerUpPostgreSQL
 * -----------------------------------------------------------------------------
 * @param {key} key 設定キー名（main等）
 * @param {object} config 設定データ
 */
const dockerUpPostgreSQL = module.exports.dockerUpPostgreSQL = (key, config)=>
{
	return new Promise((resolve, reject)=>{

		// 引数用意
		let postgresql = config.db.postgresql[key]
		let container_name = `${config.base_name}-postgresql-${key}`
		let args = [];
		args.push('run', '-d', '-it')
		args.push('-e', 'TERM=xterm-256color')
		args.push('-e', 'LC_ALL=C')
		args.push('--name', container_name)
		args.push('--label', `genie_runmode="${config.runmode}"`)
		args.push('--label', `genie_root="${config.root}"`)
		args.push('-v', `${config.root}/.genie/files/opt/postgresql/:/opt/postgresql/`)
		args.push('-v', `${postgresql.volume_lock ? 'locked_': ''}${container_name}:/var/lib/postgresql/data`)
		args.push('-e', `POSTGRES_LABEL=${key}`)
		args.push('-e', `POSTGRES_HOST=${postgresql.host}`)
		args.push('-e', `POSTGRES_DB=${postgresql.name}`)
		args.push('-e', `POSTGRES_USER=${postgresql.user}`)
		args.push('-e', `POSTGRES_PASSWORD=${postgresql.pass}`)
		args.push('-e', `POSTGERS_ENCODING=${postgresql.encoding}`)
		args.push('-e', `POSTGERS_LOCALE=${postgresql.locale}`)
		if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
		if(config.core.docker.options) args.push(`${config.core.docker.options}`)
		if(postgresql.external_port) {
			args.push('-p',
				postgresql.external_port==='auto'
					? '5432'
					: `${postgresql.external_port}:5432`
			)
		}
		args.push('--entrypoint=/opt/postgresql/before-entrypoint.sh')
		args.push('--restart=always')
		args.push(postgresql.repository)
		args.push('postgres')

		// dockerコマンド実行
		child.spawn('docker', args)
			.stderr.on('data', data=>{
				if(data.toString().match(/Unable to find image '.+' locally/)) {
					process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`] = true
				}
			})
			.on('close', code=>{
				delete process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]

				// コンテナ直下に起動用コマンドを記録する（restore用）
				child.exec(`docker exec ${container_name} sh -c "echo 'docker ${args.join(' ')}' > /docker-run.cmd"`)

				// コマンド終了（でも裏で起動処理は続いている）
				resolve()
			})

	})
}

/**
 * dockerUp
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 */
const dockerUp = module.exports.dockerUp = config=>
{
	return new Promise((resolve, reject)=>{
		// 基本引数
		let args = [];
		args.push('run', '-d', '-it')
		args.push('-e', 'TERM=xterm-256color')
		args.push('-e', 'LANG=ja_JP.UTF-8')
		args.push('-e', 'LC_ALL=ja_JP.UTF-8')
		args.push('-v', config.root+'/.genie/files/opt:/opt')
		args.push('--label', `genie_runmode="${config.runmode}"`)
		args.push('--label', `genie_root="${config.root}"`)
		args.push(`--name=${config.base_name}`)
		if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
		if(config.core.docker.options) args.push(`${config.core.docker.options}`)
		args.push('--restart=always')

		// PostgreSQL関係
		if(config.db.postgresql){
			let keys = Object.keys(config.db.postgresql);
			for(let i=0; i<keys.length; i++) {
				let container_name = `${config.base_name}-postgresql-${keys[i]}`;
				args.push('--link', container_name)
				args.push('--add-host', config.db.postgresql[keys[i]].host + ':' + getContainerIp(container_name, config))
			}
		}

		// MySQL関係
		if(config.db.mysql){
			let keys = Object.keys(config.db.mysql);
			for(let i=0; i<keys.length; i++) {
				let container_name = `${config.base_name}-mysql-${keys[i]}`;
				args.push('--link', container_name)
				args.push('--add-host', config.db.mysql[keys[i]].host + ':' + getContainerIp(container_name, config))
			}
		}

		// phpenvコンテナ関係
		if(config.lang.php.phpenv_image){
			let container_name = config.lang.php.phpenv_container_name
			args.push('--volumes-from', container_name)
		}

		// SSHD関係
		if(config.trans.sshd && config.trans.sshd.enabled){
			if(config.trans.sshd.external_port) {
				args.push('-p',
					config.trans.sshd.external_port==='auto'
						? '22'
						: `${config.trans.sshd.external_port}:22`
				)
			} else {
				args.push('--expose', 22)
			}
		}

		// Apache関係
		if(config.http.apache && config.http.apache.enabled){
			args.push('-v', `${config.root}/${config.http.apache.public_dir}:/var/www/html`)
			if(config.http.apache.external_http_port) {
				args.push('-p',
					config.http.apache.external_http_port==='auto'
						? '80'
						: `${config.http.apache.external_http_port}:80`
				)
			} else {
				args.push('--expose', 80)
			}
			if(config.http.apache.external_https_port) {
				args.push('-p',
					config.http.apache.external_https_port==='auto'
						? '443'
						: `${config.http.apache.external_https_port}:443`
				)
			} else {
				args.push('--expose', 443)
			}
		}

		// Nginx関係
		if(config.http.nginx && config.http.nginx.enabled){
			args.push('-v', `${config.root}/${config.http.nginx.public_dir}:/usr/share/nginx/html`)
			if(config.http.nginx.external_http_port) {
				args.push('-p',
					config.http.nginx.external_http_port==='auto'
						? '80'
						: `${config.http.nginx.external_http_port}:80`
				)
			} else {
				args.push('--expose', 80)
			}
			if(config.http.nginx.external_https_port) {
				args.push('-p',
					config.http.nginx.external_https_port==='auto'
						? '443'
						: `${config.http.nginx.external_https_port}:443`
				)
			} else {
				args.push('--expose', 443)
			}
		}

		// MailDev関係
		if(config.mail.maildev && config.mail.maildev.enabled) {
			if(config.mail.maildev.external_port) {
				args.push('-p',
					config.mail.maildev.external_port==='auto'
						? '9981'
						: `${config.mail.maildev.external_port}:9981`
				)
			} else {
				args.push('--expose', 9981)
			}
		}

		// Fluentd関係
		if(config.log.fluentd) {
			args.push('-v', `${config.root}/.genie/files/opt/td-agent:/etc/td-agent`)
		}

		// 追加ホスト
		if(config.core.docker.hosts && Array.isArray(config.core.docker.hosts) && config.core.docker.hosts.length) {
			for(let i=0; i<config.core.docker.hosts.length; i++){
				args.push(`--add-host=${config.core.docker.hosts[i]}`)
			}
		}

		// 追加マウント
		// args.push('-v', `${config.root}/:/mnt/host/`) // 不要と思うので。しばらくして問題ないようならそのまま削除す。
		if(config.core.docker.mounts && Array.isArray(config.core.docker.mounts) && config.core.docker.mounts.length) {
			for(let i=0; i<config.core.docker.mounts.length; i++){
				if(config.core.docker.mounts[i].match(/^\//)) {
					args.push('-v', `${config.core.docker.mounts[i]}`)
				} else {
					args.push('-v', `${config.root}/${config.core.docker.mounts[i]}`)
				}
			}
		}

		// マウントモードがcopyの時はマウント先を全て/_/に変更する。（起動後、コンテナ側で正しいパスにコピーされる）
		if(config.core.docker.mount_mode==='copy') {
			for(let i=0; i<args.length; i++) {
				if(args[i]==='-v') {
					args[i+1] = args[i+1].replace(/(.+\:)([^\:]+)(\:?([^\:]+))?$/g, '$1\/_$2\:ro')
					i++
				}
			}
		}
		// ただし/genie/だけは通常のshareモードでマウントするようにする
		args.push('-v', config.root+'/.genie:/genie')

		// 設定値を環境変数値に
		let envs = data2envs(config, 'GENIE')
		envs.GENIE_RUNMODE=config.runmode;
		let keys = Object.keys(envs)
		for(let i=0; i<keys.length; i++) {
			args.push('-e', `${keys[i]}=${envs[keys[i]]}`)
		}

		// イメージ指定
		args.push(config.core.docker.image)

		// dockerコマンド実行
		let result = child.spawnSync('docker', args)
		if(result.status) {
			reject(result.stderr.toString())
		} else {
			// 実際のポート番号を対応する内部ポート番号ごとに環境変数にセットする -> GENIE_PORTxx
			let list = child.spawnSync('docker', [
				'inspect',
				'--format="{{.NetworkSettings.Ports}}"',
				config.base_name,
			])
			let stdout_string = list.stdout.toString()
			if(stdout_string && stdout_string.trim().length > 7) { // "map[]" が帰ってきたらポート指定されてないってこと
				let matches = stdout_string.match(/\d+\/\w+\:\[\{[\d\.]+ \d+\}\]/g)
				if(matches) {
					for(let lump of matches) {
						let matches = lump.match(/(\d+)\/\w+\:\[\{[\d\.]+ (\d+)\}\]/)
						process.env['GENIE_PORT'+matches[1]] = matches[2]
					}
				}
			}
			// 実際のホストIPも環境変数にセットする -> GENIE_HOST_IP
			process.env['GENIE_HOST_IP'] = config.host_ip
			resolve();
		}

	})
}

/**
 * dockerUpPhpEnv
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 */
const dockerUpPhpEnv = module.exports.dockerUpPhpEnv = (config)=>
{
	return new Promise((resolve, reject)=>{

		// 引数用意
		let version = config.lang.php.phpenv_image.match(/\:([\.\d]+)$/)[1]
		let container_name = `${config.base_name}-phpenv-${version}`
		config.lang.php.phpenv_version = version
		config.lang.php.phpenv_container_name = container_name;
		let args = [];
		args.push('run')
		args.push('--name', container_name)
		args.push('--label', `genie_runmode="${config.runmode}"`)
		args.push('--label', `genie_root="${config.root}"`)
		args.push('--label', `genie_anyenv="phpenv"`)
		args.push(config.lang.php.phpenv_image)

		// dockerコマンド実行
		child.spawn('docker', args)
			.stderr.on('data', data=>{
				if(data.toString().match(/Unable to find image '.+' locally/)) {
					process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`] = true
				}
			})
			.on('close', code=>{
				delete process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]
				// コマンド終了（でも裏で起動処理は続いている）
				resolve()
			})

	})
}

/**
 * existContainers
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 * @param {string} name_filter dockerの--filter引数渡す`name=`以降の値。無ければ genie_root と genie_runmode のラベルのみフィルター対象になる
 */
const existContainers = module.exports.existContainers = (config, name_filter)=>{
	let filters = [
		'--filter', `label=genie_root="${config.root}"`,
		'--filter', `label=genie_runmode="${config.runmode}"`,
	]
	if(name_filter) filters.push('--filter', `name=${name_filter}`)
	let result = child.spawnSync('docker', ['ps', '-a', '--format', '{{.ID}}\t{{.Names}}', ...filters])
	if(result.status) { Error(result.stderr.toString()) }
	let containers = [];
	for(let container of result.stdout.toString().split(/\n/)){
		let colums = container.split(/\t+/)
		if(colums[0]) {
			containers.push({
				id:   colums[0],
				name: colums[1],
			})
		}
	}
	return containers.length ? containers : false
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

/**
 * sleep
 * -----------------------------------------------------------------------------
 * @param {number} msec
 */
const sleep = module.exports.sleep = msec=>new Promise(ok=>setTimeout(ok, msec))

/**
 * data to env
 * -----------------------------------------------------------------------------
 * @param {data}
 * @param {parent_key}
 */
const data2envs = module.exports.data2envs = (data, parent_key)=>{
	let envs = {}
	let conv = (data, parent_key)=>{
		if(data && typeof(data)==='object' && !Array.isArray(data)) {
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
	conv(data, parent_key)
	return envs
}

/**
 * para_progress
 * -----------------------------------------------------------------------------
 * @param {data}
 *
 *  並行処理用のプログレス
 *
 * [ex1]
 *	await lib.para_progress([
 *		{
 *			label: 'proc1',
 *			func: new Promise(ok=>setTimeout(ok, 1000)),
 *		},
 *		{
 *			label: color.blackBright('proc2'),
 *			func: new Promise(ok=>setTimeout(ok, 2000)),
 *		},
 *	])
 *
 * [ex2]
 *	await lib.para_progress([
 *		{
 *			label: 'proc1',
 *			func:
 *				new Promise((ok,ng)=>{
 *					setTimeout(ok, 1000)
 *				}),
 *			proc: color.yellow('running'),
 *			ok: color.green('ready!'),
 *			ng: color.red('error!')
 *		},
 *	])
 */
const para_progress = module.exports.para_progress = list=>{
	return new Promise(async (resolve, reject)=>{
		console.log()
		let done_count = 0

		// 処理開始
		for(let i in list) {
			list[i].status = null;
			list[i].func
				.then(()=>{list[i].status = true})
				.catch(e=>{list[i].status = false; list[i].error=e})
				.then(()=>{done_count++})
		}

		// プログレス表示
		let count = 0;
		do {
			// 更新ウェイト
			await sleep(100)

			// 状況出力
			if(count++) process.stdout.write(color.move.up(list.length));
			for(let item of list) {
				process.stdout.write(color.erase.line);
				let status = item.status===null
					? color.yellow(item.proc ? item.proc : 'running')
					: item.status
						? color.green(item.ok ? item.ok : 'ready!')
						: color.red(item.ng ? item.ng : 'error! '+item.error)
				console.log(`  ${item.label} ... ${status}`)
			}
		} while(done_count !== list.length)

		resolve()
	})

}

/**
 * get_external_port
 * -----------------------------------------------------------------------------
 * @param {} config
 * @param int internal_port
 */
const get_external_port = module.exports.get_external_port = (config, internal_port)=>{
	let result = child.spawnSync('docker', ['port', config.base_name, internal_port])
	if(result.status) return false
	let matches = result.stdout.toString().trim().match(/(\d+)$/);
	return matches[1] ? matches[1] : false
}
