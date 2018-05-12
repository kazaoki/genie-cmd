// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({14:[function(require,module,exports) {

'use strict';

const fs = require('fs');
const strwidth = require('string-width');
const color = require('cli-color');
const wrap = require('jp-wrap')(color.windowSize.width - 8);
const readline = require('readline').createInterface(process.stdin, process.stdout);
const child = require('child_process');
const path = require('path');
const util = require('util');

/**
 * d
 * -----------------------------------------------------------------------------
 * @param {object} ダンプ表示するデータオブジェクト
 */
const d = module.exports.d = data => console.log(util.inspect(data, { colors: true, compact: false, breakLength: 10, depth: 10 }));

/**
 * h
 * -----------------------------------------------------------------------------
 * @param {string} 見出し文字列
 * @param {function} cli-colorメソッド
 */
const h = module.exports.h = (title, clc = color.white) => console.log('\n  ' + clc(title));

/**
 * プロジェクトルートパスを返す（.genie/ がある直近の親ディレクトリを返す）
 * -----------------------------------------------------------------------------
 * @return {string} プロジェクトルートパス。失敗した場合はfalse
 */
const getProjectRootDir = module.exports.getProjectRootDir = () => {
	let root_dir = '';
	let check_dir = __dirname;
	let cont = true;
	do {
		try {
			fs.accessSync(check_dir + '/.genie');
			root_dir = check_dir;
		} catch (err) {
			let temp = check_dir;
			check_dir = path.dirname(check_dir);
			if (temp === check_dir) cont = false;
		}
	} while (root_dir === '' && cont);
	if (root_dir) {
		return root_dir;
	} else {
		Error('先祖ディレクトリに .genie/ が見つかりませんでした。\n`genie init` などして初期化してください。');
	}
};

/**
 * Repeat
 * -----------------------------------------------------------------------------
 * @param {string} string 繰り返したい文字
 * @param {number} times 繰り返したい回数
 * @return {string} 繰り返した文字列
 */
const Repeat = module.exports.Repeat = (string, times = 1) => {
	if (!times > 0) return '';
	let lump = '';
	for (let i = 0; i < times; i++) {
		lump += string;
	}
	return lump;
};

/**
 * Message
 * -----------------------------------------------------------------------------
 * @param {string} message 表示したいメッセージ。改行込み複数行対応。
 * @param {string} type タイプ。primary|success|danger|warning|info|default
 * @param {number} line タイトル線を引く位置。
 */
const Message = module.exports.Message = (message, type = 'default', line = 0) => {
	let indent = '  ';
	let line_color = color.white;
	let fg_color = color.white;
	if (type === 'primary') {
		line_color = color.xterm(26);
		fg_color = color.xterm(39);
	} else if (type === 'success') {
		line_color = color.green;
		fg_color = color.greenBright;
	} else if (type === 'danger') {
		line_color = color.red;
		fg_color = color.redBright;
	} else if (type === 'warning') {
		line_color = color.yellow;
		fg_color = color.yellowBright;
	} else if (type === 'info') {
		line_color = color.whiteBright;
		fg_color = color.whiteBright;
	} else if (type === 'whisper') {
		line_color = color.blackBright;
		fg_color = color.blackBright;
	}

	message = wrap(message.replace(/[\r\n]+$/, ''));
	let messages = message.split(/[\r\n]+/);
	let width = 0;
	for (let i in messages) {
		let len = strwidth(messages[i]);
		if (width < len) width = len;
	}
	width += 2;

	console.log(indent + line_color('┏') + line_color(Repeat('─', width)) + line_color('┓'));
	for (let i in messages) {
		if (line > 0 && line == i) {
			console.log(indent + line_color('┣') + line_color(Repeat('─', width)) + line_color('┫'));
		}
		console.log(indent + line_color('│') + fg_color(' ' + messages[i] + ' ') + Repeat(' ', width - 2 - strwidth(messages[i])) + line_color('│'));
	}
	console.log(indent + line_color('┗') + line_color(Repeat('─', width)) + line_color('┛'));
};

/**
 * Messages
 * -----------------------------------------------------------------------------
 * @param {objext} 複数メッセージを一挙に出力
 */
const Messages = module.exports.Messages = messages => {
	if (!Array.isArray(messages)) messages = [messages];
	for (let i in messages) {
		for (let key in messages[i]) {
			Message(messages[i][key], key);
		}
	}
};

/**
 * Input
 * -----------------------------------------------------------------------------
 * @param {string} message 入力を促す表示メッセージ
 * @param {number} tail_space 背景BOXの長さを追加する文字数
 * @return {string} 入力値
 */
const Input = module.exports.Input = (message, tail_space = 20) => {
	let indent = color.bgBlack('  ');
	message = '  ' + message + '  ';
	let len = strwidth(message) + tail_space;
	let fg = color.whiteBright.bgBlueBright;
	let bg = color.bgBlue;
	console.log('\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + fg(message + Repeat(' ', tail_space)) + '\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + bg(Repeat(' ', len)));
	process.stdout.write(color.move.up(3));
	process.stdout.write(color.move.right(len - tail_space));
	return new Promise(result => {
		readline.on('line', input => {
			process.stdout.write(color.move.down(3));
			result(input);
		});
	});
};

/**
 * Say
 * -----------------------------------------------------------------------------
 * @param {string} message スピーチする文字列
 */
const Say = module.exports.Say = message => {
	if (message.length === 0) return;
	// Macの場合はsayコマンド
	if (isMac()) {
		child.execSync(`say -r 300 "${message}"`);
	}
	// Windowsの場合はwscriptスクリプトをtempに用意してから実行（最後は削除する）
	else if (isWindows()) {
			let temp_dir = fs.mkdtempSync(process.env.TEMP + '/genie-say-');
			let temp_file = temp_dir + '/say.js';
			fs.writeFileSync(temp_file, `var args = [];for(var i = 0; i < WScript.Arguments.length; i++) args.push(WScript.Arguments.Item(i));WScript.CreateObject('SAPI.SpVoice').Speak('<volume level="100">'+'<rate speed="2">'+'<pitch middle="0">'+args.join(' ')+'</pitch>'+'</rate>'+'</volume>', 8);`);
			child.execSync(`start wscript ${temp_file} "${message}"`);
			fs.unlinkSync(temp_file);
			fs.rmdirSync(temp_dir);
		}
};

/**
 * loadConfig
 * -----------------------------------------------------------------------------
 * @param {object} argv コマンド引数
 */
const loadConfig = module.exports.loadConfig = argv => {

	// プロジェクトルートパス取得
	let root_dir = getProjectRootDir();
	let config_js = `${root_dir}/.genie/${argv.config}`;
	try {
		fs.accessSync(config_js);
	} catch (err) {
		Error(`設定ファイル（.genie/${argv.config}）が見つかりませんでした。`);
	}

	// ファイルロード
	let config = require(config_js).config;

	// 実行モードをセット
	config.runmode = argv.mode;

	// 実行時の定義をセット
	config.run = {};
	{
		// コンテナベース名セット
		config.run.base_name = argv.shadow ? config.core.docker.name + '-SHADOW' : config.core.docker.name;

		// プロジェクトルートセット
		config.run.project_dir = getProjectRootDir();

		// シャドウモードかセット
		if (argv.shadow) config.run.shadow = 1;
	}

	// config.jsでDockerMachine名が未指定でも環境変数に入っていればセット
	if (!config.core.docker.machine && process.env.DOCKER_MACHINE_NAME) {
		config.core.docker.machine = process.env.DOCKER_MACHINE_NAME;
	}

	// ブラウザから見る用のホストIPを取得しておく
	if (config.core.docker.ip_force) {
		config.run.host_ip = config.core.docker.ip_force;
	} else if (hasDockerMachineEnv() && config.core.docker.machine) {
		let result = child.spawnSync('docker-machine', ['ip', config.core.docker.machine]);
		if (result.status) Error(result.stderr.toString());
		config.run.host_ip = result.stdout.toString().trim();
	} else {
		config.run.host_ip = 'localhost';
	}

	return config;
};

/**
 * isWindows
 * -----------------------------------------------------------------------------
 * @return {boolean} Windowsかどうか
 */
const isWindows = module.exports.isWindows = () => {
	return process.platform === 'win32';
};

/**
 * isMac
 * -----------------------------------------------------------------------------
 * @return {boolean} MacOSかどうか
 */
const isMac = module.exports.isMac = () => {
	return process.platform === 'darwin';
};

/**
 * hasDockerMachineEnv
 * -----------------------------------------------------------------------------
 * @return {boolean} DockerMachine環境があるかどうか
 */
const hasDockerMachineEnv = module.exports.hasDockerMachineEnv = () => {
	let result = child.spawnSync('docker-machine');
	return result.status === 0;
};

/**
 * Error
 * -----------------------------------------------------------------------------
 * @param {string} エラーメッセージ
 */
const Error = module.exports.Error = message => {
	console.log();
	Message(`エラーが発生しました。\n${message}`, 'danger', 1);
	Say('エラーが発生しました');
	process.exit();
};

/**
 * dockerDown
 * -----------------------------------------------------------------------------
 * @param {string} コンテナタイプ：genie|postgresql|mysql
 * @param {object} config
 */
const dockerDown = module.exports.dockerDown = (name_filter, config) => {
	return new Promise((resolve, reject) => {
		let containers = existContainers(config, name_filter);
		if (!containers) resolve();
		let delfuncs = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = containers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				let container = _step.value;

				delfuncs.push(new Promise((ok, ng) => {
					child.spawn('docker', ['rm', '-f', container.id]).stderr.on('data', data => {
						console.log(color.blackBright(`  [Container] ${container.name} (${container.id}) ... `) + color.red('delete NG!'));
						ng(data);
					}).on('close', code => {
						console.log(color.blackBright(`  [Container] ${container.name} (${container.id}) ... `) + color.green('deleted'));
						ok();
					});
				}));
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		Promise.all(delfuncs).catch(err => {
			Error(err);
		}).then(() => {
			resolve();
		});
	});
};

/**
 * dockerUpMySQL
 * -----------------------------------------------------------------------------
 * @param {key} key 設定キー名（main等）
 * @param {object} config 設定データ
 */
const dockerUpMySQL = module.exports.dockerUpMySQL = (key, config) => {
	return new Promise((resolve, reject) => {

		// 引数用意
		let mysql = config.db.mysql[key];
		let container_name = `${config.run.base_name}-mysql-${key}`;
		let args = [];
		args.push('run', '-d', '-it');
		args.push('-e', 'TERM=xterm-256color');
		args.push('--name', container_name);
		args.push('--label', `genie_project_dir="${config.run.project_dir}"`);
		if (config.run.shadow) args.push('--label', 'genie_shadow');
		args.push('-v', `${config.run.project_dir}/.genie/files/opt/mysql/:/opt/mysql/`);
		args.push('-v', `${mysql.volume_lock ? 'locked_' : ''}${container_name}:/var/lib/mysql`);
		args.push('-e', `MYSQL_LABEL=${key}`);
		args.push('-e', `MYSQL_ROOT_PASSWORD=${mysql.pass}`);
		args.push('-e', `MYSQL_DATABASE=${mysql.name}`);
		args.push('-e', `MYSQL_USER=${mysql.user}`);
		args.push('-e', `MYSQL_PASSWORD=${mysql.pass}`);
		args.push('-e', `MYSQL_CHARSET=${mysql.charset}`);
		if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
		if (config.core.docker.options) args.push(`${config.core.docker.options}`);
		if (mysql.external_port) args.push('-p', `${mysql.external_port}:3306`);
		args.push('--entrypoint=/opt/mysql/before-entrypoint.sh');
		args.push('--restart=always');
		args.push(mysql.repository);
		args.push('mysqld');
		if (mysql.charset) args.push(`--character-set-server=${mysql.charset}`);
		if (mysql.collation) args.push(`--collation-server=${mysql.collation}`);

		// dockerコマンド実行
		child.spawn('docker', args).stderr.on('data', data => {
			if (data.toString().match(/Unable to find image '.+' locally/)) {
				process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`] = true;
			}
		}).on('close', code => {
			delete process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`];
			resolve();
		});
	});
};

/**
 * dockerUpPostgreSQL
 * -----------------------------------------------------------------------------
 * @param {key} key 設定キー名（main等）
 * @param {object} config 設定データ
 */
const dockerUpPostgreSQL = module.exports.dockerUpPostgreSQL = (key, config) => {
	return new Promise((resolve, reject) => {

		// 引数用意
		let postgresql = config.db.postgresql[key];
		let container_name = `${config.run.base_name}-postgresql-${key}`;
		let args = [];
		args.push('run', '-d', '-it');
		args.push('-e', 'TERM=xterm-256color');
		args.push('--name', container_name);
		args.push('--label', `genie_project_dir="${config.run.project_dir}"`);
		if (config.run.shadow) args.push('--label', 'genie_shadow');
		args.push('-v', `${config.run.project_dir}/.genie/files/opt/postgresql/:/opt/postgresql/`);
		args.push('-v', `${postgresql.volume_lock ? 'locked_' : ''}${container_name}:/var/lib/postgresql/data`);
		args.push('-e', `POSTGRES_LABEL=${key}`);
		args.push('-e', `POSTGRES_HOST=${postgresql.host}`);
		args.push('-e', `POSTGRES_DB=${postgresql.name}`);
		args.push('-e', `POSTGRES_USER=${postgresql.user}`);
		args.push('-e', `POSTGRES_PASSWORD=${postgresql.pass}`);
		args.push('-e', `POSTGERS_ENCODING=${postgresql.encoding}`);
		args.push('-e', `POSTGERS_LOCALE=${postgresql.locale}`);
		if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
		if (config.core.docker.options) args.push(`${config.core.docker.options}`);
		if (postgresql.external_port) args.push('-p', `${postgresql.external_port}:5432`);
		args.push('--entrypoint=/opt/postgresql/before-entrypoint.sh');
		args.push('--restart=always');
		args.push(postgresql.repository);
		args.push('postgres');

		// dockerコマンド実行
		child.spawn('docker', args).stderr.on('data', data => {
			if (data.toString().match(/Unable to find image '.+' locally/)) {
				process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`] = true;
			}
		}).on('close', code => {
			delete process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`];
			resolve();
		});
	});
};

/**
 * dockerUp
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 */
const dockerUp = module.exports.dockerUp = config => {
	return new Promise((resolve, reject) => {
		// 基本引数
		let args = [];
		args.push('run', '-d', '-it');
		args.push('-e', 'TERM=xterm-256color');
		args.push('-e', 'LANG=ja_JP.UTF-8');
		args.push('-e', 'LC_ALL=ja_JP.UTF-8');
		args.push('-v', config.run.project_dir + '/.genie/files/opt:/opt');
		args.push('--label', `genie_project_dir="${config.run.project_dir}"`);
		if (config.run.shadow) args.push('--label', 'genie_shadow');
		args.push(`--name=${config.run.base_name}`);
		if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
		if (config.core.docker.options) args.push(`${config.core.docker.options}`);
		args.push('--restart=always');

		// Perl関係
		if (config.lang.perl.cpanfile_enabled) args.push('-e', 'PERL5LIB=/perl/cpanfile-modules/lib/perl5');

		// PostgreSQL関係
		if (config.db.postgresql) {
			let keys = Object.keys(config.db.postgresql);
			for (let i = 0; i < keys.length; i++) {
				let container_name = `${config.run.base_name}-postgresql-${keys[i]}`;
				args.push('--link', container_name);
				args.push('--add-host', config.db.postgresql[keys[i]].host + ':' + getContainerIp(container_name, config));
			}
		}

		// MySQL関係
		if (config.db.mysql) {
			let keys = Object.keys(config.db.mysql);
			for (let i = 0; i < keys.length; i++) {
				let container_name = `${config.run.base_name}-mysql-${keys[i]}`;
				args.push('--link', container_name);
				args.push('--add-host', config.db.mysql[keys[i]].host + ':' + getContainerIp(container_name, config));
			}
		}

		// SSHD関係
		if (config.trans.sshd) {
			args.push('-p', `${config.trans.sshd.external_port}:22`);
		}

		// Apache関係
		if (config.http.apache) {
			args.push('-v', `${config.run.project_dir}/${config.http.apache.public_dir}:/var/www/html`);
			if (config.http.apache.external_http_port) {
				args.push('-p', `${config.http.apache.external_http_port}:80`);
			}
			if (config.http.apache.external_https_port) {
				args.push('-p', `${config.http.apache.external_https_port}:443`);
			}
		}

		// Nginx関係
		if (config.http.nginx) {
			args.push('-v', `${config.run.project_dir}/${config.http.nginx.public_dir}:/usr/share/nginx/html`);
			if (config.http.nginx.external_http_port) {
				args.push('-p', `${config.http.nginx.external_http_port}:80`);
			}
			if (config.http.nginx.external_https_port) {
				args.push('-p', `${config.http.nginx.external_https_port}:443`);
			}
		}

		// Sendlog関係
		if (config.mail.sendlog.external_port) {
			args.push('-p', `${config.mail.sendlog.external_port}:9981`);
		}

		// Fluentd関係
		if (config.log.fluentd) {
			args.push('-v', `${config.run.project_dir}/.genie/files/opt/td-agent:/etc/td-agent`);
		}

		// 追加ホスト
		if (config.core.docker.hosts && Array.isArray(config.core.docker.hosts) && config.core.docker.hosts.length) {
			for (let i = 0; i < config.core.docker.hosts.length; i++) {
				args.push(`--add-host=${config.core.docker.hosts[i]}`);
			}
		}

		// 追加マウント
		args.push('-v', `${config.run.project_dir}/:/mnt/host/`);
		if (config.core.docker.mounts && Array.isArray(config.core.docker.mounts) && config.core.docker.mounts.length) {
			for (let i = 0; i < config.core.docker.mounts.length; i++) {
				if (config.core.docker.mounts[i].match(/^\//)) {
					args.push('-v', `${config.core.docker.mounts[i]}`);
				} else {
					args.push('-v', `${config.run.project_dir}/${config.core.docker.mounts[i]}`);
				}
			}
		}

		// 設定値を環境変数値に
		let envs = {};
		let conv = (data, parent_key) => {
			if (typeof data === 'object' && !Array.isArray(data)) {
				// 再帰
				let keys = Object.keys(data);
				for (let i = 0; i < keys.length; i++) {
					conv(data[keys[i]], `${parent_key}_${keys[i].toUpperCase()}`);
				}
			} else {
				// 変換してセット
				if (typeof data === 'object' && Array.isArray(data)) {
					envs[parent_key] = JSON.stringify(data);
				} else {
					envs[parent_key] = data;
				}
			}
		};
		conv(config, 'GENIE');
		envs.GENIE_RUNMODE = config.runmode;
		let keys = Object.keys(envs);
		for (let i = 0; i < keys.length; i++) {
			args.push('-e', `${keys[i]}=${envs[keys[i]]}`);
		}

		// イメージ指定
		args.push(config.core.docker.image);

		// dockerコマンド実行
		let result = child.spawnSync('docker', args);
		if (result.status) {
			reject(result.stderr.toString());
		} else {
			resolve();
		}
	});
};

/**
 * existContainers
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 * @param {string} name_filter dockerの--filter引数渡す`name=`以降の値。無ければ genie_project_dir と genie_shadow のラベルのみフィルター対象になる
 */
const existContainers = module.exports.existContainers = (config, name_filter) => {
	let filters = ['--filter', `label=genie_project_dir="${config.run.project_dir}"`];
	if (config.run.shadow) {
		filters.push('--filter', `label=genie_shadow`);
	}
	if (name_filter) filters.push('--filter', `name=${name_filter}`);
	let result = child.spawnSync('docker', ['ps', '-a', '--format', '{{.ID}}\t{{.Names}}', ...filters]);
	if (result.status) {
		Error(result.stderr.toString());
	}
	let containers = [];
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = result.stdout.toString().split(/\n/)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			let container = _step2.value;

			let colums = container.split(/\t+/);
			if (colums[0]) {
				containers.push({
					id: colums[0],
					name: colums[1]
				});
			}
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	return containers.length ? containers : false;
};

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
const getContainerIp = module.exports.getContainerIp = (container_name, config) => {
	try {
		let result;
		if (config.core.docker.network) {
			result = child.spawnSync('docker', ['inspect', `--format={{.NetworkSettings.Networks.${config.core.docker.network}.IPAddress}}`, container_name]);
		} else {
			result = child.spawnSync('docker', ['inspect', `--format={{.NetworkSettings.IPAddress}}`, container_name]);
		}
		if (result.stderr.toString()) {
			Error(result.stderr.toString());
		} else {
			return result.stdout.toString().replace(/[\r\n]$/, '');
		}
	} catch (err) {
		Error(err);
	}
};

/**
 * sleep
 * -----------------------------------------------------------------------------
 * @param {number} msec
 */
const sleep = module.exports.sleep = msec => {
	return new Promise(resole => {
		setTimeout(resole, msec);
	});
};
},{}],2:[function(require,module,exports) {

/**
 * demo: デモ実行
 * -----------------------------------------------------------------------------
 * ex. g demo
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (argv) {

		// メッセージBOX
		console.log();
		lib.Message('サンプル：default', 'default');
		lib.Message('サンプル：primary', 'primary');
		lib.Message('サンプル：success', 'success');
		lib.Message('サンプル：danger', 'danger');
		lib.Message('サンプル：warning', 'warning');
		lib.Message('サンプル：info', 'info');
		lib.Message('改行込み、1ライン入れも可能。\ntest1\ntest2\ntest3', 'default', 1);

		// 入力BOX
		let input = yield lib.Input('入力BOX（入力文字を発音しますのでご注意）：', 20);
		lib.Message('入力された文字：' + input);

		// sayテスト
		lib.Say(input);

		// エラーテスト
		try {
			throw new Error('エラーテスト（終了コード255）');
		} catch (err) {
			console.log(err);
			process.exit(255);
		}

		process.exit();
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":14}],3:[function(require,module,exports) {

/**
 * config: 設定ファイルを見る・開く
 * -----------------------------------------------------------------------------
 * ex. g config
 *     g config -d
 */

'use strict';

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g config [Options]').options('dump', {
		alias: 'd',
		describe: '設定値を確認します。'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	if (argv.dump) {
		// 設定値を表示する
		d(config);
	} else {
		// エディタで開く
		let config_js = `${lib.getProjectRootDir()}/.genie/${argv.config}`;
		if (lib.isWindows()) {
			child.execSync(`start ${config_js}`);
		} else if (lib.isMac()) {
			child.execSync(`open ${config_js}`);
		}
	}

	process.exit();
};
},{"./libs.js":14}],4:[function(require,module,exports) {

/**
 * ls: Dockerオブジェクト一覧
 * -----------------------------------------------------------------------------
 * ex. g ls
 *     g ls -l
 */

'use strict';

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const color = require('cli-color');
const cliui = require('cliui')({ width: color.windowSize.width - 4 });

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g ls [Options]').options('long', {
		alias: 'l',
		describe: 'コンテナ一覧がもうちょっとだけ詳細に出ます'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// docker-machine が使える環境の場合はそれも一覧する
	if (lib.hasDockerMachineEnv()) {
		console.log('\n  DockeMachines');
		let result = child.spawnSync('docker-machine', ['ls']);
		if (result.status) lib.Error(result.stderr.toString());
		lib.Message(result.stdout.toString(), 'primary', 1);
	}

	// イメージ一覧
	{
		console.log('\n  Images');
		let result = child.spawnSync('docker', ['images']);
		if (result.status) lib.Error(result.stderr.toString());
		lib.Message(result.stdout.toString(), 'primary', 1);
	}

	// データボリューム一覧
	{
		console.log('\n  Volumes');
		let result = child.spawnSync('docker', ['volume', 'ls', '--format', 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}']);
		if (result.status) lib.Error(result.stderr.toString());
		lib.Message(result.stdout.toString(), 'primary', 1);
	}

	// コンテナ一覧
	{
		console.log('\n  Containers');
		let format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'];
		let header = ['NAMES', 'ID', 'IMAGE', 'STATUS', 'PORTS'];
		if (argv.long) {
			format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Labels}}'];
			header = ['NAMES', 'ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'LABELS'];
		}
		let result = child.spawnSync('docker', ['ps', '-a', ...format]);
		if (result.status) lib.Error(result.stderr.toString());
		let lines = result.stdout.toString().trim().split('\n');
		lines.unshift(header.join('\t'));
		for (let i in lines) {
			let column = lines[i].split(/\t/);
			let set = [];
			for (let j in column) {
				let width;
				if (!argv.long) {
					// if(j==0) width = 40 // NAMES
					// if(j==1) width = 15 // ID
					// // if(j==2) width = 30 // IMAGE
					if (j == 4) width = 30; // PORTS
				} else {
					// if(j==0) width = 40 // NAMES
					// if(j==1) width = 15 // ID
					// // if(j==2) width = 30 // IMAGE
					if (j == 6) width = 30; // PORTS
					if (j == 7) width = 50; // LABELS
				}
				set.push({
					text: column[j].replace(/, ?/g, '\n'),
					width: width,
					padding: [0, 1, 0, 1]
				});
			}
			cliui.div(...set);
		}

		lib.Message(cliui.toString(), 'primary', 1);
	}

	process.exit();
};
},{"./libs.js":14}],5:[function(require,module,exports) {

/**
 * up: 設定に基づいてdockerを起動する
 * -----------------------------------------------------------------------------
 * ex. g up
 *     g up -s
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const color = require('cli-color');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g up [Options]').options('shadow', {
		alias: 's',
		describe: 'データをマウントではなくコンテナにコピーした別のコンテナを起動する'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 起動時メモの表示
	try {
		let memo = config.core.memo.up;
		if (memo) lib.Messages(memo);
	} catch (err) {
		Error('メモの設定が異常です。');
	}

	_asyncToGenerator(function* () {
		// 各コンテナ終了
		if (lib.existContainers(config)) {
			// h('対象の既存コンテナのみ削除します', color.blackBright);
			yield Promise.all([
			// lib.dockerDown('/'+config.run.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
			// lib.dockerDown('/'+config.run.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
			// lib.dockerDown('/'+config.run.base_name+'$', config), // 完全一致のgenie本体コンテナ名
			lib.dockerDown(null, config)] // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
			).catch(function (err) {
				return err;
			});
		}

		let rundb_funcs = [];

		// PostgreSQL起動関数用意
		if (config.db.postgresql) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Object.keys(config.db.postgresql)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					let key = _step.value;

					rundb_funcs.push(lib.dockerUpPostgreSQL(key, config));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}

		// MySQL起動関数用意
		if (config.db.mysql) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = Object.keys(config.db.mysql)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					let key = _step2.value;

					rundb_funcs.push(lib.dockerUpMySQL(key, config));
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}

		// 先にDBを並列起動開始
		Promise.all(rundb_funcs).catch(function (err) {
			lib.Error(err);
		}).then(function () {
			return lib.dockerUp(config).catch(function (err) {
				return lib.Error(err);
			});
		});

		// 全コンテナで準備完了するまで、ステータスファイルを監視
		console.log();
		let count = 0;
		let done = [];
		let line;
		do {
			line = [];

			// PostgreSQL
			if (config.db.postgresql && Object.keys(config.db.postgresql).length) {
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = Object.keys(config.db.postgresql)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						let key = _step3.value;

						let container_name = `${config.run.base_name}-postgresql-${key}`;
						let result = child.spawnSync('docker', ['exec', container_name, 'sh', '-c', 'ps aux|grep entrypoint.sh|grep -v grep|wc -l']);
						if (done.indexOf(container_name) !== -1 || result.stdout.toString().trim() === '0') {
							line.push(`  ${container_name} ... ${color.green('ready!')}`);
							if (done.indexOf(container_name) === -1) done.push(container_name);
						} else {
							line.push(`  ${container_name} ... ${color.yellow('loading')}`);
						}
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3.return) {
							_iterator3.return();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}
			}

			// MySQL
			if (config.db.mysql && Object.keys(config.db.mysql).length) {
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = Object.keys(config.db.mysql)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						let key = _step4.value;

						let container_name = `${config.run.base_name}-mysql-${key}`;
						let result = child.spawnSync('docker', ['logs', container_name]);
						if (done.indexOf(container_name) !== -1 || result.stdout.toString().match(/MySQL Community Server \(GPL\)/)) {
							line.push(`  ${container_name} ... ${color.green('ready!')}`);
							if (done.indexOf(container_name) === -1) done.push(container_name);
						} else if (process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]) {
							line.push(`  ${container_name} ... ${color.yellow('image downloading')}`);
						} else {
							line.push(`  ${container_name} ... ${color.yellow('loading')}`);
						}
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}
			}

			// genie本体
			let result = child.spawnSync('docker', ['exec', config.run.base_name, 'cat', '/var/log/entrypoint.log']);
			let output = result.stdout.toString();
			if (done.indexOf(config.run.base_name) !== -1 || output.match(/entrypoint\.sh setup done\./)) {
				if (done.indexOf(config.run.base_name) === -1) done.push(config.run.base_name);
				line.push(`  genie ... ${color.green('ready!')}`);
			} else if (output.match(/init\.sh setup done\./)) {
				line.push(`  genie ... ${color.yellow('init.sh setup')}`);
			} else if (output.match(/Postfix setup done\./)) {
				line.push(`  genie ... ${color.yellow('Postfix setup')}`);
			} else if (output.match(/Nginx setup done\./)) {
				line.push(`  genie ... ${color.yellow('Nginx setup')}`);
			} else if (output.match(/Apache setup done\./)) {
				line.push(`  genie ... ${color.yellow('Apache setup')}`);
			} else if (output.match(/Node.js setup done\./)) {
				line.push(`  genie ... ${color.yellow('Node.js setup')}`);
			} else if (output.match(/Ruby setup done\./)) {
				line.push(`  genie ... ${color.yellow('Ruby setup')}`);
			} else if (output.match(/PHP setup done\./)) {
				line.push(`  genie ... ${color.yellow('PHP setup')}`);
			} else if (output.match(/Perl setup done\./)) {
				line.push(`  genie ... ${color.yellow('Perl setup')}`);
			} else if (output.match(/entrypoint\.sh setup start\./)) {
				line.push(`  genie ... ${color.yellow('loading')}`);
			} else {
				line.push(`  genie ... ${color.yellow('waiting')}`);
			}

			// 状況出力
			if (count++) process.stdout.write(color.move.up(line.length));
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = line[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					let string = _step5.value;

					process.stdout.write(color.erase.line);
					console.log(string);
				}

				// 待ち
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			if (done.length !== line.length) {
				yield lib.sleep(100);
			}
		} while (done.length !== line.length);

		h('起動完了!!');

		process.exit();
	})();
};
},{"./libs.js":14}],6:[function(require,module,exports) {

/**
 * down: 設定に基づいてdockerを終了する
 * -----------------------------------------------------------------------------
 * ex. g down
 *     g down -s
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g down [Options]').options('shadow', {
		alias: 's',
		describe: 'データをマウントではなくコンテナにコピーした別のコンテナを終了する'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 終了時メモの表示
	try {
		let memo = config.core.memo.down;
		if (memo) lib.Messages(memo);
	} catch (err) {
		Error('メモの設定が異常です。');
	}

	_asyncToGenerator(function* () {
		yield Promise.all([
		// lib.dockerDown('/'+config.run.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
		// lib.dockerDown('/'+config.run.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
		// lib.dockerDown('/'+config.run.base_name+'$', config), // 完全一致のgenie本体コンテナ名
		lib.dockerDown(null, config)] // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
		).catch(function (err) {
			return err;
		}).then(function () {
			h('DONE!');
			process.exit();
		});
	})();
};
},{"./libs.js":14}],7:[function(require,module,exports) {

/**
 * cli: 起動中のコンテナ内でコマンドを実行する・コンテナのシェルに入る
 * -----------------------------------------------------------------------------
 * ex. g cli
 *     g cli ls -la
 */

'use strict';

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g cli [Options] [Commands]').options('host', {
		describe: '実行するホスト名を指定する'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定
	let config = lib.loadConfig(argv);
	let host = argv.host ? argv.host : config.core.docker.name;
	let cmds = process.argv.slice(process.argv.findIndex(elem => elem === argv._[1])); // ちょっと強引だけど、デフォ引数を省いた位置から末尾までをコマンドラインとして取得する

	// dockerが起動しているか
	if (!lib.existContainers(config, '/' + host + '$')) lib.Error('dockerコンテナが起動していません: ' + host);

	// 引数があれば実行して結果を返す
	if (argv._.length !== 1) {
		let result = child.spawnSync('docker', ['exec', host, ...cmds]);
		if (result.status) {
			lib.Error(result.stderr.toString() || result.stdout.toString()); // dockerを通してるため stderr ではなく stdout 側にメッセージが流れてくる場合があるため
			process.exit();
		}
		console.log(result.stdout.toString());
		process.exit();
	}

	// 引数が無ければコマンドラインに入る
	else {
			child.spawnSync('docker', ['exec', '-it', host, 'bash'], { stdio: 'inherit' });
			process.exit();
		}
};
},{"./libs.js":14}],8:[function(require,module,exports) {

/**
 * reject: 全てのdockerコンテナ・ボリュームを削除する
 * -----------------------------------------------------------------------------
 * ex. g reject
 *     g reject -f
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const inquirer = require('inquirer');
const color = require('cli-color');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g reject [Options]').options('force', {
		alias: 'f',
		describe: 'lockedから始まる名前も対象にする'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// コンテナ一覧取得
	let list_containers = [];
	let result = child.spawnSync('docker', ['ps', '-qa', '--format', '{{.Names}}\t{{.Status}}']);
	if (result.status) lib.Error(result.stderr.toString());
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			let line = _step.value;

			if (!line) continue;
			let column = line.split(/\t/);
			let name = column[0];
			let status = column[1];
			let is_locked = name.match(/^locked_/);
			let label = `[Container] ${name}`;
			if (is_locked) label = color.blackBright(label);
			list_containers.push({
				name: label,
				checked: is_locked && !argv.f ? false : true
			});
		}

		// ボリューム一覧取得
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	let list_volumes = [];
	result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}\t{{.Driver}}']);
	if (result.status) lib.Error(result.stderr.toString());
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			let line = _step2.value;

			if (!line) continue;
			let column = line.split(/\t/);
			let name = column[0];
			let driver = column[1];
			let is_locked = name.match(/^locked_/);
			let label = `[Volume] ${name}`;
			if (is_locked) label = color.blackBright(label);
			list_volumes.push({
				name: label,
				checked: is_locked && !argv.f ? false : true
			});
		}

		// 対象数カウント
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	let list_count = list_containers.length + list_volumes.length;
	if (list_count === 0) {
		h('対象のオブジェクトはありませんでした。');
		process.exit();
	}

	console.log();
	inquirer.prompt([{
		type: 'checkbox',
		message: '削除したいものにチェックを入れて Enter してください。',
		name: 'rejects',
		pageSize: 100,
		choices: [...list_containers, ...list_volumes]
	}]).then(answers => {

		// 画面クリア
		process.stdout.write(color.move.up(list_count));
		for (let i = 0; i < list_count; i++) {
			process.stdout.write(color.erase.line);
			process.stdout.write(color.move.down(1));
		}
		process.stdout.write(color.move.up(list_count));

		// 削除処理開始
		_asyncToGenerator(function* () {
			let name_volumes = [];
			let name_containters = [];

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = answers.rejects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					let label = _step3.value;

					label = color.strip(label);
					let matches = label.match(/^\[(Container|Volume)\] (.+)$/);
					if (matches[1] === 'Container') name_containters.push(matches[2]);else if (matches[1] === 'Volume') name_volumes.push(matches[2]);
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			console.log();

			// コンテナ削除実行
			let funcs = [];
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = name_containters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					let name = _step4.value;

					funcs.push(new Promise(function (resolve, reject) {
						child.spawn('docker', ['rm', '-fv', name]).stderr.on('data', function (data) {
							console.log(`  [Container] ${name} - ${color.red('ng')}`);
							reject(data);
						}).on('close', function (code) {
							console.log(`  [Container] ${name} - ${color.green('deleted')}`);
							resolve();
						});
					}));
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			yield Promise.all(funcs).catch(function (err) {
				lib.Error(err);
			});

			// コンテナ削除実行
			funcs = [];
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = name_volumes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					let name = _step5.value;

					funcs.push(new Promise(function (resolve, reject) {
						child.spawn('docker', ['volume', 'rm', '-f', name]).stderr.on('data', function (data) {
							console.log(`  [Volume] ${name} - ${color.red('ng')}`);
							reject(data);
						}).on('close', function (code) {
							console.log(`  [Volume] ${name} - ${color.green('deleted')}`);
							resolve();
						});
					}));
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			yield Promise.all(funcs).catch(function (err) {
				lib.Error(err);
			});

			process.exit();
		})();
	});
};
},{"./libs.js":14}],9:[function(require,module,exports) {

/**
 * clean: 不要なdockerオブジェクトを削除する
 * -----------------------------------------------------------------------------
 * ex. g clean
 *     g clean -f
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const color = require('cli-color');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g clean [Options]').options('force', {
		alias: 'f',
		describe: 'lockedから始まる名前も対象にする'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	let cmd;
	let result;
	let count = 0;
	let funcs;

	_asyncToGenerator(function* () {

		// コンテナ削除（exitedなやつ）
		funcs = [];
		cmd = ['ps', '-qa', '--filter', 'exited=0', '--format', '{{.Names}}'];
		result = child.spawnSync('docker', cmd);
		if (result.status) lib.Error(result.stderr.toString());
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				let name = _step.value;

				if (!name) continue;
				if (!argv.f) if (name.match(/^locked_/i)) continue;
				funcs.push(new Promise(function (resolve, reject) {
					if (!count++) console.log();
					child.spawn('docker', ['rm', '-fv', name]).stderr.on('data', function (data) {
						return reject(data);
					}).on('close', function (code) {
						console.log(`  [Container] ${name} - ${color.green('deleted')}`);
						resolve();
					});
				}));
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		yield Promise.all(funcs).catch(function (err) {
			lib.Error(err);
		});

		// ボリューム削除（リンクされてないやつ）
		funcs = [];
		cmd = ['volume', 'ls', '--filter', 'dangling=true', '--format', '{{.Name}}'];
		result = child.spawnSync('docker', cmd);
		if (result.status) lib.Error(result.stderr.toString());
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				let name = _step2.value;

				if (!name) continue;
				if (!argv.f) if (name.match(/^locked_/i)) continue;
				funcs.push(new Promise(function (resolve, reject) {
					if (!count++) console.log();
					child.spawn('docker', ['volume', 'rm', '-f', name]).stderr.on('data', function (data) {
						return reject(data);
					}).on('close', function (code) {
						console.log(`  [Volume] ${name} - ${color.green('deleted')}`);
						resolve();
					});
				}));
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		yield Promise.all(funcs).catch(function (err) {
			lib.Error(err);
		});

		// イメージ削除（<none>のやつ）
		cmd = ['images', '-q', '--filter', 'dangling=true'];
		result = child.spawnSync('docker', cmd);
		if (result.status) lib.Error(result.stderr.toString());
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				let id = _step3.value;

				if (!id) continue;
				funcs.push(new Promise(function (resolve, reject) {
					if (!count++) console.log();
					child.spawn('docker', ['rmi', id]).stderr.on('data', function (data) {
						return reject(data);
					}).on('close', function (code) {
						console.log(`  [Image] ${id} - ${color.green('deleted')}`);
						resolve();
					});
				}));
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		yield Promise.all(funcs).catch(function (err) {
			lib.Error(err);
		});

		// 対象なし
		if (!count) h('対象のオブジェクトはありませんでした。');

		process.exit();
	})();
};
},{"./libs.js":14}],10:[function(require,module,exports) {

/**
 * build: 設定に基づいてイメージをビルドする
 * -----------------------------------------------------------------------------
 * ex. g build
 *     g build --no-cache
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const color = require('cli-color');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g build [Options]').options('no-cache', {
		alias: 'n',
		describe: 'キャッシュを使用せずにビルドする'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	_asyncToGenerator(function* () {
		// 確認
		let input = yield lib.Input(`${config.core.docker.image} イメージをビルドしてもよろしいでしょうか。[y/N]: `);

		// ビルド実行
		if (input.match(/^y$/i)) {
			let args = ['build', '-t', config.core.docker.image];
			if (argv['no-cache']) args.push('--no-cache');
			args.push(`${lib.getProjectRootDir()}/.genie/image/`);
			lib.Message(`ビルドを開始します。\ndocker ${args.join(' ')}`, 'info');
			console.log();
			let stream = child.spawn('docker', args);
			stream.stdout.on('data', function (data) {
				console.log(color.blackBright(data.toString().trim()));
			});
			stream.stderr.on('data', function (data) {
				lib.Error(data);
				process.exit();
			});
			stream.on('close', function (code) {
				let mes = 'ビルドが完了しました。';
				lib.Message(mes);
				lib.Say(mes);
				process.exit();
			});
		}
	})();
};
},{"./libs.js":14}],11:[function(require,module,exports) {

/**
 * langver: 指定可能な各言語のバージョンを確認する
 * -----------------------------------------------------------------------------
 * ex. g langver
 *     g langver --perl
 */

'use strict';

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g langver [Options]').options('php', { describe: 'PHPの利用可能なバージョン一覧を表示' }).options('perl', { describe: 'Perlの利用可能なバージョン一覧を表示' }).options('ruby', { describe: 'Rubyの利用可能なバージョン一覧を表示' }).options('node', { describe: 'Node.jsの利用可能なバージョン一覧を表示' }).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 各言語バージョンの表示
	if (argv.php) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions']);
		lib.Message(result.stdout.toString(), 'primary');
	} else if (argv.perl) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions']);
		lib.Message(result.stdout.toString(), 'primary');
	} else if (argv.ruby) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions']);
		lib.Message(result.stdout.toString(), 'primary');
	} else if (argv.node) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions']);
		lib.Message(result.stdout.toString(), 'primary');
	} else {
		console.log();
		lib.Message(option.help(), 'primary', 1);
	}

	process.exit();
};
},{"./libs.js":14}],17:[function(require,module,exports) {

/**
 * mysql: MySQL操作
 * -----------------------------------------------------------------------------
 * ex. g mysql
 *     g mysql --cli
 *     g mysql --cli -n container1
 *     g mysql --dump
 *     g mysql --dump -n container1  -n container2
 *     g mysql --restore
 *     g mysql --restore -n container1  -n container2
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const inquirer = require('inquirer');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g mysql [Options]').options('cli', {
		describe: 'MySQLコンテナのCLIに入る'
	}).options('dump', {
		alias: 'd',
		describe: 'MySQLのダンプを取る'
	}).options('restore', {
		alias: 'r',
		describe: 'MySQLのリストアを行う'
	}).options('name', {
		alias: 'n',
		describe: '対象のMySQLコンテナ名を直接指定する'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定
	let config = lib.loadConfig(argv);
	if (!(config.db.mysql && Object.keys(config.db.mysql).length)) {
		lib.Error('MySQL設定がありません。');
	}

	// dockerが起動しているか
	if (!lib.existContainers(config, '/' + config.run.base_name + '$')) {
		lib.Error('dockerコンテナが起動していません: ' + config.run.base_name);
	}

	_asyncToGenerator(function* () {

		// --cli: MySQLコンテナの中に入る
		if (argv.cli) {
			let container_name = yield get_target_containers(config, argv, { is_single: true });
			let key = get_key_from_container_name(config, container_name);
			child.spawnSync('docker', ['exec', '-it', container_name, 'bash'], { stdio: 'inherit' });
			process.exit();
		}

		// --dump: ダンプを取る
		else if (argv.dump) {
				d('DUMP');
				let container_name = yield get_target_containers(config, argv, { has_all: true });
				d(container_name);
				process.exit();
			}

			// --restore: レストアする
			else if (argv.restore) {
					d('RESTORE');
					let container_name = yield get_target_containers(config, argv, { has_all: true });
					d(container_name);
					process.exit();
				}

				// mysqlコマンドに入る
				else {
						let container_name = yield get_target_containers(config, argv, { is_single: true });
						let key = get_key_from_container_name(config, container_name);
						child.spawnSync('docker', ['exec', '-it', container_name, 'mysql', config.db.mysql[key].name, `-u${config.db.mysql[key].user}`, `-p${config.db.mysql[key].pass}`], { stdio: 'inherit' });
						process.exit();
					}
	})();
};

/**
 * コンテナを選択させる
 */
function get_target_containers(config, argv, option = {}) {
	// 引数で指定があればそれ
	if (argv.name) {
		return option.is_single && Array.isArray(argv.name) ? argv.name[0] // single指定なのに複数引数に書いてある場合は最初のやつ
		: argv.name;
	}

	// １つしかなければそれ
	if (Object.keys(config.db.mysql).length === 1) {
		return `${config.run.base_name}-mysql-${Object.keys(config.db.mysql)[0]}`;
	}

	// ２つ以上あれば選択肢
	return _asyncToGenerator(function* () {
		let key;
		let container_name;

		// 選択肢用意
		let list = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = Object.keys(config.db.mysql)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				let name = _step.value;

				list.push(`${name} (${config.run.base_name}-mysql-${name})`);
			}

			// 選択開始
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		if (option.has_all) list.push('全て');
		console.log();
		let result = yield inquirer.prompt([{
			type: 'list',
			message: '対象のMySQLコンテナを選択してください。',
			name: 'container',
			pageSize: 100,
			choices: list
		}]).catch(function (err) {
			lib.Error(err);
		});

		// 選択肢返却
		if (result.container === '全て') {
			let containers = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = Object.keys(config.db.mysql)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					let key = _step2.value;

					containers.push(`${config.run.base_name}-mysql-${key}`);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return containers;
		} else {
			let matches = result.container.match(/^(\w+) /);
			return `${config.run.base_name}-mysql-${matches[1]}`;
		}
	})();
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key;
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = Object.keys(config.db.mysql)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			let tmpkey = _step3.value;

			if (container_name === `${config.run.base_name}-mysql-${tmpkey}`) {
				key = tmpkey;
				break;
			}
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return key;
}
},{"./libs.js":14}],20:[function(require,module,exports) {

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

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const inquirer = require('inquirer');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g psql [Options]').options('cli', {
		describe: 'PostgreSQLコンテナのCLIに入る'
	}).options('dump', {
		alias: 'd',
		describe: 'PostgreSQLのダンプを取る'
	}).options('restore', {
		alias: 'r',
		describe: 'PostgreSQLのリストアを行う'
	}).options('name', {
		alias: 'n',
		describe: '対象のPostgreSQLコンテナ名を直接指定する'
	}).argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定
	let config = lib.loadConfig(argv);
	if (!(config.db.postgresql && Object.keys(config.db.postgresql).length)) {
		lib.Error('PostgreSQL設定がありません。');
	}

	// dockerが起動しているか
	if (!lib.existContainers(config, '/' + config.run.base_name + '$')) {
		lib.Error('dockerコンテナが起動していません: ' + config.run.base_name);
	}

	_asyncToGenerator(function* () {

		// --cli: PostgreSQLコンテナの中に入る
		if (argv.cli) {
			let container_name = yield get_target_containers(config, argv, { is_single: true });
			let key = get_key_from_container_name(config, container_name);
			child.spawnSync('docker', ['exec', '-it', container_name, 'bash'], { stdio: 'inherit' });
			process.exit();
		}

		// --dump: ダンプを取る
		else if (argv.dump) {
				d('DUMP');
				let container_name = yield get_target_containers(config, argv, { has_all: true });
				d(container_name);
				process.exit();
			}

			// --restore: レストアする
			else if (argv.restore) {
					d('RESTORE');
					let container_name = yield get_target_containers(config, argv, { has_all: true });
					d(container_name);
					process.exit();
				}

				// psqlコマンドに入る
				else {
						let container_name = yield get_target_containers(config, argv, { is_single: true });
						let key = get_key_from_container_name(config, container_name);
						child.spawnSync('docker', ['exec', '-it', container_name, 'psql', config.db.postgresql[key].name, '-U', config.db.postgresql[key].user], { stdio: 'inherit' });
						process.exit();
					}
	})();
};

/**
 * コンテナを選択させる
 */
function get_target_containers(config, argv, option = {}) {
	// 引数で指定があればそれ
	if (argv.name) {
		return option.is_single && Array.isArray(argv.name) ? argv.name[0] // single指定なのに複数引数に書いてある場合は最初のやつ
		: argv.name;
	}

	// １つしかなければそれ
	if (Object.keys(config.db.postgresql).length === 1) {
		return `${config.run.base_name}-postgresql-${Object.keys(config.db.postgresql)[0]}`;
	}

	// ２つ以上あれば選択肢
	return _asyncToGenerator(function* () {
		let key;
		let container_name;

		// 選択肢用意
		let list = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = Object.keys(config.db.postgresql)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				let name = _step.value;

				list.push(`${name} (${config.run.base_name}-postgresql-${name})`);
			}

			// 選択開始
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		if (option.has_all) list.push('全て');
		console.log();
		let result = yield inquirer.prompt([{
			type: 'list',
			message: '対象のPostgreSQLコンテナを選択してください。',
			name: 'container',
			pageSize: 100,
			choices: list
		}]).catch(function (err) {
			lib.Error(err);
		});

		// 選択肢返却
		if (result.container === '全て') {
			let containers = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = Object.keys(config.db.postgresql)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					let key = _step2.value;

					containers.push(`${config.run.base_name}-postgresql-${key}`);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return containers;
		} else {
			let matches = result.container.match(/^(\w+) /);
			return `${config.run.base_name}-postgresql-${matches[1]}`;
		}
	})();
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key;
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = Object.keys(config.db.postgresql)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			let tmpkey = _step3.value;

			if (container_name === `${config.run.base_name}-postgresql-${tmpkey}`) {
				key = tmpkey;
				break;
			}
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return key;
}
},{"./libs.js":14}],12:[function(require,module,exports) {

/**
 * open: 設定されたURL情報を指定のブラウザで開く
 * -----------------------------------------------------------------------------
 * ex. g open
 */

'use strict';

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');
const color = require('cli-color');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g open [Options]').argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定
	let config = lib.loadConfig(argv);

	// ブラウザで開く
	let cmd;
	if (lib.isWindows) {
		cmd = 'start';
	} else if (lib.isWindows) {
		cmd = 'open';
	} else {
		cmd = 'xdg-open';
	}
	let app = '';
	let internal_port = config.http.browser.schema === 'https' ? 443 : 80;
	let result = child.spawnSync('docker', ['port', config.run.base_name, internal_port]);
	if (result.status) Error(result.stderr.toString());
	let matches = result.stdout.toString().trim().match(/(\d+)$/);
	let port = matches[1];
	if (config.http.browser.schema === 'http' && port == 80 || config.http.browser.schema === 'https' && port == 443) {
		port = '';
	} else {
		port = `:${port}`;
	}
	let url = `${config.http.browser.schema}://${config.run.host_ip}${port}${config.http.browser.path}`;
	if (!(config.http.browser.apps && config.http.browser.apps.length)) config.http.browser.apps = [''];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = config.http.browser.apps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			app = _step.value;

			let arg = '';
			if (lib.isWindows()) {
				if (app === 'chrome') arg = ' chrome';else if (app === 'firefox') arg = ' firefox'; // できなかった
				else if (app === 'ie') arg = ' explorer';else if (app === 'opera') arg = ' opera'; // 未確認
					else if (app) {
							arg = ` ${app}`;
						}
			} else {
				if (app === 'chrome') arg = ' -a chrome';else if (app === 'firefox') arg = ' -a firefox';else if (app === 'safari') arg = ' -a safari';else if (app === 'opera') arg = ' -a opera'; // 未確認
				else if (app) {
						arg = ` -a ${app}`;
					}
			}
			d(`${cmd}${arg} ${url}`);
			child.execSync(`${cmd}${arg} ${url}`);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	process.exit();
};
},{"./libs.js":14}],13:[function(require,module,exports) {

/**
 * logs: 起動中のコンテナのログを見る
 * -----------------------------------------------------------------------------
 * ex. g logs
 */

'use strict';

const lib = require('./libs.js');
const d = lib.d;
const h = lib.h;
const child = require('child_process');

module.exports = option => {

	// オプション設定
	let argv = option.usage('Usage: genie|g logs [Options] [Commands]').argv;
	;
	if (argv.help) {
		console.log();
		lib.Message(option.help(), 'primary', 1);
		process.exit();
	}

	// 設定
	let config = lib.loadConfig(argv);

	// dockerが起動しているか
	if (!lib.existContainers(config, `/${config.run.base_name}$`)) lib.Error('dockerコンテナが起動していません: ' + docker.run.base_name);

	// コマンド用意
	let args = [];
	try {
		if (!(config.log.tail && config.log.tail[0] && config.log.tail[0].length)) throw new Error('ログ設定が正しくありません。');

		// 横分割設定（グループが２つ以上の場合）
		if (config.log.tail.length > 1) {
			args.push('-s', '2');
		}

		// ファイル設定
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = config.log.tail[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				let files = _step.value;

				let is_first = true;
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						let file = _step2.value;

						if (typeof file === 'object' && Array.isArray(file)) {
							args.push('-ci', file[1]);
							if (!is_first) args.push('-I');
							args.push(file[0]);
						} else if (typeof file === 'string') {
							if (!is_first) args.push('-I');
							args.push(file);
						} else {
							throw new Error('ログ設定が正しくない可能性があります。（指定できるのは文字列か配列のみです）' + file);
						}
						is_first = false;
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	} catch (err) {
		lib.Error(err);
	}

	// multitail実行
	child.spawnSync('docker', ['exec', '-it', config.run.base_name, 'multitail', ...args], { stdio: 'inherit' });

	process.exit();
};
},{"./libs.js":14}],1:[function(require,module,exports) {
///usr/bin/env node

'use strict';

/**
 * 標準引数定義
 * -----------------------------------------------------------------------------
 */

const option = require('optimist');
let argv = option.usage('Usage: genie|g [Commands] [Options]').options('mode', {
	alias: 'm',
	default: 'develop',
	describe: '実行モードを指定可能'
}).options('config', {
	alias: 'c',
	default: 'config.js',
	describe: '設定ファイルを指定可能'
}).options('help', {
	alias: 'h',
	describe: '説明表示'
}).argv;

/**
 * 各コマンド機能を実行する
 * -----------------------------------------------------------------------------
 */
if (argv._[0] === 'demo') require('./cmd-demo.js')(option);
// else if(argv._[0]==='init')    require('./cmd-init.js')(option)
else if (argv._[0] === 'config') require('./cmd-config.js')(option);else if (argv._[0] === 'ls') require('./cmd-ls.js')(option);else if (argv._[0] === 'up') require('./cmd-up.js')(option);else if (argv._[0] === 'down') require('./cmd-down.js')(option);else if (argv._[0] === 'cli') require('./cmd-cli.js')(option);else if (argv._[0] === 'reject') require('./cmd-reject.js')(option);else if (argv._[0] === 'clean') require('./cmd-clean.js')(option);else if (argv._[0] === 'build') require('./cmd-build.js')(option);else if (argv._[0] === 'langver') require('./cmd-langver.js')(option);else if (argv._[0] === 'mysql') require('./cmd-mysql.js')(option);else if (argv._[0] === 'psql') require('./cmd-psql.js')(option);else if (argv._[0] === 'open') require('./cmd-open.js')(option);
	// else if(argv._[0]==='ngrok')   require('./cmd-ngrok.js')(option)
	else if (argv._[0] === 'logs') require('./cmd-logs.js')(option);
		// else if(argv._[0]==='dlsync')  require('./cmd-dlsync.js')(option)

		/**
   * help
   * -----------------------------------------------------------------------------
   */
		else {
				const lib = require('./libs.js');
				console.log();
				lib.Message(option.help() + '\n' + 'Commands:\n' + '  init      \n' + '  config    設定を確認する\n' + '  ls        Dockerコンテナ状況を確認する\n' + '  up        設定に基づきDockerコンテナを起動する\n' + '  down      関連するコンテナのみ終了する\n' + '  update    \n' + '  cli       コンテナ内でコマンドを実行。またはコンテナに入る\n' + '  reject    genie対象外のコンテナまたはボリュームを一括削除する\n' + '  clean     不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n' + '  build     基本のdockerイメージをビルドする\n' + '  langver   各種言語の利用可能なバージョンを確認する\n' + '  mysql     MySQLを操作する\n' + '  psql      PostgreSQLを操作する\n' + '  open      ブラウザで開く\n' + '  ngrok     \n' + '  logs      実行ログを見る\n' + '  dlsync    \n' + '  httpd     \n' + '  demo      デモ\n', 'warning', 1);
				process.exit();
			}
},{"./cmd-demo.js":2,"./cmd-config.js":3,"./cmd-ls.js":4,"./cmd-up.js":5,"./cmd-down.js":6,"./cmd-cli.js":7,"./cmd-reject.js":8,"./cmd-clean.js":9,"./cmd-build.js":10,"./cmd-langver.js":11,"./cmd-mysql.js":17,"./cmd-psql.js":20,"./cmd-open.js":12,"./cmd-logs.js":13,"./libs.js":14}]},{},[1])