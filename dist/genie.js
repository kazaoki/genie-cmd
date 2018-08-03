// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
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

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
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
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({3:[function(require,module,exports) {

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const strwidth = require('string-width');
const color = require('cli-color');
const wrap = require('jp-wrap')(color.windowSize.width - 8);
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
 * ルートパスを返す（.genie/ がある直近の親ディレクトリを返す）
 * -----------------------------------------------------------------------------
 * @return {string} ルートパス。失敗した場合はfalse
 */
const getRootDir = module.exports.getRootDir = () => {
	let root_dir = '';
	let check_dir = process.cwd();
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
	const readline = require('readline').createInterface(process.stdin, process.stdout);

	let indent = color.bgBlack('  ');
	message = '  ' + message + '  ';
	let len = strwidth(message) + tail_space;
	let fg = color.whiteBright.bgBlueBright;
	let bg = color.bgBlue;
	process.stdout.write('\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + fg(message + Repeat(' ', tail_space)) + '\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + bg(Repeat(' ', len)) + '\n');
	process.stdout.write(color.move.up(3));
	process.stdout.write(color.move.right(len - tail_space));
	return new Promise(result => {
		readline.on('line', input => {
			process.stdout.write(color.move.down(3));
			readline.close();
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
 * showRunmode
 * -----------------------------------------------------------------------------
 */
const showRunmode = module.exports.showRunmode = message => {
	console.log(color.blackBright(`<${process.env.GENIE_RUNMODE}>`));
};

/**
 * loadConfig
 * -----------------------------------------------------------------------------
 * @param {object} argv コマンド引数
 */
const loadConfig = module.exports.loadConfig = argv => {

	// ルートパス取得
	let root_dir = getRootDir();
	let config_js = path.join(root_dir, '.genie', argv.config);
	try {
		fs.accessSync(config_js);
	} catch (err) {
		Error(`設定ファイル（.genie/${argv.config}）が見つかりませんでした。`);
	}

	// ファイルロード
	try {
		delete require.cache[require.resolve(config_js)];
	} catch (e) {}
	let config = require(config_js).config;

	// 実行モードをセット
	config.runmode = argv.mode;

	// ルートセット
	config.root = root_dir;

	// test時の基本調整
	if (config.runmode === 'test') {
		config.core.docker.name += '-TEST';
		config.core.docker.mount_mode = 'copy';
		config.core.docker.down_with_volumes = true;
		config.core.memo = undefined;
		config.lang.php.error_report = false;
		config.log.fluentd = undefined;
		config.http.browser.at_upped = undefined;
		config.http.apache.external_http_port = 'auto';
		config.http.apache.external_https_port = 'auto';
		config.mail.postfix.enabled = false;
		config.mail.maildev.external_port = undefined;
		if (config.db.mysql) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Object.keys(config.db.mysql)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					let key = _step.value;

					config.db.mysql[key].external_port = undefined;
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
		if (config.db.postgresql) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = Object.keys(config.db.postgresql)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					let key = _step2.value;

					config.db.postgresql[key].external_port = undefined;
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
	}

	// 追加の設定（config-[ランモード].js）があればロード
	let paths = path.parse(config_js);
	let add_config_js;
	if (path.isAbsolute(config_js)) {
		add_config_js = `${paths.dir}/${paths.name}-${config.runmode}${paths.ext}`;
	} else {
		add_config_js = `${root_dir}/.genie/${paths.dir}/${paths.name}-${config.runmode}${paths.ext}`;
	}

	try {
		fs.accessSync(add_config_js);
		eval(fs.readFileSync(add_config_js).toString());
	} catch (err) {}

	// コンテナベース名セット
	config.base_name = config.core.docker.name;

	// config.jsでDockerMachine名が未指定でも環境変数に入っていればセット
	if (!config.core.docker.machine && process.env.DOCKER_MACHINE_NAME) {
		config.core.docker.machine = process.env.DOCKER_MACHINE_NAME;
	}

	// ブラウザから見る用のホストIPを取得しておく
	if (config.core.docker.ip_force) {
		config.host_ip = config.core.docker.ip_force;
	} else if (hasDockerMachineEnv() && config.core.docker.machine) {
		let result = child.spawnSync('docker-machine', ['ip', config.core.docker.machine]);
		if (result.status) Error(result.stderr.toString());
		config.host_ip = result.stdout.toString().trim();
	} else {
		config.host_ip = 'localhost';
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
const dockerDown = module.exports.dockerDown = (config, wz_volumes) => {
	return new Promise((resolve, reject) => {
		let containers = existContainers(config);
		if (!containers) resolve();
		let delfuncs = [];
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = containers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				let container = _step3.value;

				delfuncs.push(new Promise((ok, ng) => {
					child.spawn('docker', ['rm', '-f', '-v', container.id]).stderr.on('data', data => {
						console.log(color.blackBright(`  [Container] ${container.name} (${container.id}) ... `) + color.red('delete NG!'));
						ng(data);
					}).on('close', code => {
						console.log(color.blackBright(`  [Container] ${container.name} (${container.id}) ... `) + color.green('deleted'));
						ok();
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

		Promise.all(delfuncs).catch(err => {
			Error(err);
		}).then(() => {
			if (config.core.docker.down_with_volumes || wz_volumes) {
				// 関連ボリューム削除
				let delfuncs = [];
				let regex = new RegExp(`^(locked_)?${config.base_name}`);
				let result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}']);
				if (result.status) Error(result.stderr.toString());
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = result.stdout.toString().trim().split(/\n/)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						let volume_name = _step4.value;

						if (volume_name.match(regex)) {
							delfuncs.push(new Promise((ok, ng) => {
								child.spawn('docker', ['volume', 'rm', '-f', volume_name]).stderr.on('data', data => {
									console.log(color.blackBright(`  [Volume] ${volume_name} ... `) + color.red('delete NG!'));
									ng(data);
								}).on('close', code => {
									console.log(color.blackBright(`  [Volume] ${volume_name} ... `) + color.green('deleted'));
									ok();
								});
							}));
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

				Promise.all(delfuncs).catch(err => {
					Error(err);
				}).then(() => {
					resolve();
				});
			} else {
				resolve();
			}
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
		let container_name = `${config.base_name}-mysql-${key}`;
		let args = [];
		args.push('run', '-d', '-it');
		args.push('-e', 'TERM=xterm-256color');
		args.push('--name', container_name);
		args.push('--label', `genie_runmode="${config.runmode}"`);
		args.push('--label', `genie_root="${config.root}"`);
		args.push('-v', `${config.root}/.genie/files/opt/mysql/:/opt/mysql/`);
		args.push('-v', `${mysql.volume_lock ? 'locked_' : ''}${container_name}:/var/lib/mysql`);
		args.push('-e', `MYSQL_LABEL=${key}`);
		args.push('-e', `MYSQL_ROOT_PASSWORD=${mysql.pass}`);
		args.push('-e', `MYSQL_DATABASE=${mysql.name}`);
		args.push('-e', `MYSQL_USER=${mysql.user}`);
		args.push('-e', `MYSQL_PASSWORD=${mysql.pass}`);
		args.push('-e', `MYSQL_CHARSET=${mysql.charset}`);
		if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
		if (config.core.docker.options) args.push(`${config.core.docker.options}`);
		if (mysql.external_port) {
			args.push('-p', mysql.external_port === 'auto' ? '3306' : `${mysql.external_port}:3306`);
		}
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

			// コンテナ直下に起動用コマンドを記録する（restore用）
			child.exec(`docker exec ${container_name} sh -c "echo 'docker ${args.join(' ')}' > /docker-run.cmd"`);

			// コマンド終了（でも裏で起動処理は続いている）
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
		let container_name = `${config.base_name}-postgresql-${key}`;
		let args = [];
		args.push('run', '-d', '-it');
		args.push('-e', 'TERM=xterm-256color');
		args.push('-e', 'LC_ALL=C');
		args.push('--name', container_name);
		args.push('--label', `genie_runmode="${config.runmode}"`);
		args.push('--label', `genie_root="${config.root}"`);
		args.push('-v', `${config.root}/.genie/files/opt/postgresql/:/opt/postgresql/`);
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
		if (postgresql.external_port) {
			args.push('-p', postgresql.external_port === 'auto' ? '5432' : `${postgresql.external_port}:5432`);
		}
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

			// コンテナ直下に起動用コマンドを記録する（restore用）
			child.exec(`docker exec ${container_name} sh -c "echo 'docker ${args.join(' ')}' > /docker-run.cmd"`);

			// コマンド終了（でも裏で起動処理は続いている）
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
		args.push('-v', config.root + '/.genie/files/opt:/opt');
		args.push('--label', `genie_runmode="${config.runmode}"`);
		args.push('--label', `genie_root="${config.root}"`);
		args.push(`--name=${config.base_name}`);
		if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
		if (config.core.docker.options) args.push(`${config.core.docker.options}`);
		args.push('--restart=always');

		// Perl関係
		if (config.lang.perl.cpanfile_enabled) args.push('-e', 'PERL5LIB=/perl/cpanfile-modules/lib/perl5');

		// PostgreSQL関係
		if (config.db.postgresql) {
			let keys = Object.keys(config.db.postgresql);
			for (let i = 0; i < keys.length; i++) {
				let container_name = `${config.base_name}-postgresql-${keys[i]}`;
				args.push('--link', container_name);
				args.push('--add-host', config.db.postgresql[keys[i]].host + ':' + getContainerIp(container_name, config));
			}
		}

		// MySQL関係
		if (config.db.mysql) {
			let keys = Object.keys(config.db.mysql);
			for (let i = 0; i < keys.length; i++) {
				let container_name = `${config.base_name}-mysql-${keys[i]}`;
				args.push('--link', container_name);
				args.push('--add-host', config.db.mysql[keys[i]].host + ':' + getContainerIp(container_name, config));
			}
		}

		// phpenvコンテナ関係
		if (config.lang.php.phpenv_image) {
			let container_name = config.lang.php.phpenv_container_name;
			args.push('--volumes-from', container_name);
		}

		// SSHD関係
		if (config.trans.sshd && config.trans.sshd.enabled) {
			if (config.trans.sshd.external_port) {
				args.push('-p', config.trans.sshd.external_port === 'auto' ? '22' : `${config.trans.sshd.external_port}:22`);
			}
		}

		// Apache関係
		if (config.http.apache && config.http.apache.enabled) {
			args.push('-v', `${config.root}/${config.http.apache.public_dir}:/var/www/html`);
			if (config.http.apache.external_http_port) {
				args.push('-p', config.http.apache.external_http_port === 'auto' ? '80' : `${config.http.apache.external_http_port}:80`);
			}
			if (config.http.apache.external_https_port) {
				args.push('-p', config.http.apache.external_https_port === 'auto' ? '443' : `${config.http.apache.external_https_port}:443`);
			}
		}

		// Nginx関係
		if (config.http.nginx && config.http.nginx.enabled) {
			args.push('-v', `${config.root}/${config.http.nginx.public_dir}:/usr/share/nginx/html`);
			if (config.http.nginx.external_http_port) {
				args.push('-p', config.http.nginx.external_http_port === 'auto' ? '80' : `${config.http.nginx.external_http_port}:80`);
			}
			if (config.http.nginx.external_https_port) {
				args.push('-p', config.http.nginx.external_https_port === 'auto' ? '443' : `${config.http.nginx.external_https_port}:443`);
			}
		}

		// MailDev関係
		if (config.mail.maildev && config.mail.maildev.enabled) {
			if (config.mail.maildev.external_port) {
				args.push('-p', config.mail.maildev.external_port === 'auto' ? '9981' : `${config.mail.maildev.external_port}:9981`);
			}
		}

		// Fluentd関係
		if (config.log.fluentd) {
			args.push('-v', `${config.root}/.genie/files/opt/td-agent:/etc/td-agent`);
		}

		// 追加ホスト
		if (config.core.docker.hosts && Array.isArray(config.core.docker.hosts) && config.core.docker.hosts.length) {
			for (let i = 0; i < config.core.docker.hosts.length; i++) {
				args.push(`--add-host=${config.core.docker.hosts[i]}`);
			}
		}

		// 追加マウント
		// args.push('-v', `${config.root}/:/mnt/host/`) // 不要と思うので。しばらくして問題ないようならそのまま削除す。
		if (config.core.docker.mounts && Array.isArray(config.core.docker.mounts) && config.core.docker.mounts.length) {
			for (let i = 0; i < config.core.docker.mounts.length; i++) {
				if (config.core.docker.mounts[i].match(/^\//)) {
					args.push('-v', `${config.core.docker.mounts[i]}`);
				} else {
					args.push('-v', `${config.root}/${config.core.docker.mounts[i]}`);
				}
			}
		}

		// マウントモードがcopyの時はマウント先を全て/_/に変更する。（起動後、コンテナ側で正しいパスにコピーされる）
		if (config.core.docker.mount_mode === 'copy') {
			for (let i = 0; i < args.length; i++) {
				if (args[i] === '-v') {
					args[i + 1] = args[i + 1].replace(/(.+\:)([^\:]+)(\:?([^\:]+))?$/g, '$1\/_$2\:ro');
					i++;
				}
			}
		}
		// ただし/genie/だけは通常のshareモードでマウントするようにする
		args.push('-v', config.root + '/.genie:/genie');

		// 設定値を環境変数値に
		let envs = data2envs(config, 'GENIE');
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
			// 実際のポート番号を対応する内部ポート番号ごとに環境変数にセットする -> GENIE_PORTxx
			let list = child.spawnSync('docker', ['inspect', '--format="{{.NetworkSettings.Ports}}"', config.base_name]);
			if (list.stdout.toString().trim().length > 7) {
				// "map[]" が帰ってきたらポート指定されてないってこと
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = list.stdout.toString().match(/\d+\/\w+\:\[\{[\d\.]+ \d+\}\]/g)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						let lump = _step5.value;

						let matches = lump.match(/(\d+)\/\w+\:\[\{[\d\.]+ (\d+)\}\]/);
						process.env['GENIE_PORT' + matches[1]] = matches[2];
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
			}
			// 実際のホストIPも環境変数にセットする -> GENIE_HOST_IP
			process.env['GENIE_HOST_IP'] = config.host_ip;

			resolve();
		}
	});
};

/**
 * dockerUpPhpEnv
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 */
const dockerUpPhpEnv = module.exports.dockerUpPhpEnv = config => {
	return new Promise((resolve, reject) => {

		// 引数用意
		let version = config.lang.php.phpenv_image.match(/\:([\.\d]+)$/)[1];
		let container_name = `${config.base_name}-phpenv-${version}`;
		config.lang.php.phpenv_version = version;
		config.lang.php.phpenv_container_name = container_name;
		let args = [];
		args.push('run');
		args.push('--name', container_name);
		args.push('--label', `genie_runmode="${config.runmode}"`);
		args.push('--label', `genie_root="${config.root}"`);
		args.push('--label', `genie_anyenv="phpenv"`);
		args.push(config.lang.php.phpenv_image);

		// dockerコマンド実行
		child.spawn('docker', args).stderr.on('data', data => {
			if (data.toString().match(/Unable to find image '.+' locally/)) {
				process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`] = true;
			}
		}).on('close', code => {
			delete process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`];
			// コマンド終了（でも裏で起動処理は続いている）
			resolve();
		});
	});
};

/**
 * existContainers
 * -----------------------------------------------------------------------------
 * @param {object} config 設定データ
 * @param {string} name_filter dockerの--filter引数渡す`name=`以降の値。無ければ genie_root と genie_runmode のラベルのみフィルター対象になる
 */
const existContainers = module.exports.existContainers = (config, name_filter) => {
	let filters = ['--filter', `label=genie_root="${config.root}"`, '--filter', `label=genie_runmode="${config.runmode}"`];
	if (name_filter) filters.push('--filter', `name=${name_filter}`);
	let result = child.spawnSync('docker', ['ps', '-a', '--format', '{{.ID}}\t{{.Names}}', ...filters]);
	if (result.status) {
		Error(result.stderr.toString());
	}
	let containers = [];
	var _iteratorNormalCompletion6 = true;
	var _didIteratorError6 = false;
	var _iteratorError6 = undefined;

	try {
		for (var _iterator6 = result.stdout.toString().split(/\n/)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
			let container = _step6.value;

			let colums = container.split(/\t+/);
			if (colums[0]) {
				containers.push({
					id: colums[0],
					name: colums[1]
				});
			}
		}
	} catch (err) {
		_didIteratorError6 = true;
		_iteratorError6 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion6 && _iterator6.return) {
				_iterator6.return();
			}
		} finally {
			if (_didIteratorError6) {
				throw _iteratorError6;
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
const sleep = module.exports.sleep = msec => new Promise(ok => setTimeout(ok, msec));

/**
 * data to env
 * -----------------------------------------------------------------------------
 * @param {data}
 * @param {parent_key}
 */
const data2envs = module.exports.data2envs = (data, parent_key) => {
	let envs = {};
	let conv = (data, parent_key) => {
		if (data && typeof data === 'object' && !Array.isArray(data)) {
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
	conv(data, parent_key);
	return envs;
};

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
const para_progress = module.exports.para_progress = list => {
	return new Promise((() => {
		var _ref = _asyncToGenerator(function* (resolve, reject) {
			console.log();
			let done_count = 0;

			// 処理開始
			for (let i in list) {
				list[i].status = null;
				list[i].func.then(function () {
					list[i].status = true;
				}).catch(function (e) {
					list[i].status = false;list[i].error = e;
				}).then(function () {
					done_count++;
				});
			}

			// プログレス表示
			let count = 0;
			do {
				// 更新ウェイト
				yield sleep(100);

				// 状況出力
				if (count++) process.stdout.write(color.move.up(list.length));
				var _iteratorNormalCompletion7 = true;
				var _didIteratorError7 = false;
				var _iteratorError7 = undefined;

				try {
					for (var _iterator7 = list[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
						let item = _step7.value;

						process.stdout.write(color.erase.line);
						let status = item.status === null ? color.yellow(item.proc ? item.proc : 'running') : item.status ? color.green(item.ok ? item.ok : 'ready!') : color.red(item.ng ? item.ng : 'error! ' + item.error);
						console.log(`  ${item.label} ... ${status}`);
					}
				} catch (err) {
					_didIteratorError7 = true;
					_iteratorError7 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion7 && _iterator7.return) {
							_iterator7.return();
						}
					} finally {
						if (_didIteratorError7) {
							throw _iteratorError7;
						}
					}
				}
			} while (done_count !== list.length);

			resolve();
		});

		return function (_x, _x2) {
			return _ref.apply(this, arguments);
		};
	})());
};

/**
 * get_external_port
 * -----------------------------------------------------------------------------
 * @param {} config
 * @param int internal_port
 */
const get_external_port = module.exports.get_external_port = (config, internal_port) => {
	let result = child.spawnSync('docker', ['port', config.base_name, internal_port]);
	if (result.status) Error(result.stderr.toString());
	let matches = result.stdout.toString().trim().match(/(\d+)$/);
	return matches[1] ? matches[1] : false;
};
},{}],4:[function(require,module,exports) {

/**
 * demo: デモ実行
 * -----------------------------------------------------------------------------
 * ex. g demo
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

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
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],5:[function(require,module,exports) {

/**
 * init：初期化
 * -----------------------------------------------------------------------------
 * ex. g init
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const path = require('path');
const fs = require('fs-extra');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g init').argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// パス決定
		let from = path.join(__dirname, '../.genie');
		let to = path.join(process.cwd(), '.genie');

		// コピー元の存在確認
		try {
			fs.accessSync(from);
		} catch (e) {
			lib.Error(`初期化元になる .genie/ ディレクトリが見つかりません。 genic-cmd 自体を再インストールしてください。\n${from}`);
		}

		// コピー先の存在確認
		try {
			fs.accessSync(to);
			lib.Error(`このディレクトリには既に .genie/ が存在しています。\n${to}`);
		} catch (e) {}

		// .gnieコピー
		fs.copySync(from, to);
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],6:[function(require,module,exports) {

/**
 * config: 設定ファイルを見る・開く
 * -----------------------------------------------------------------------------
 * ex. g config
 *     g config -d
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {
		// オプション設定
		let argv = option.usage('Usage: genie|g config [Options]').options('dump', {
			alias: 'd',
			describe: '設定値を確認します。'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定ファイルロード
		let config = lib.loadConfig(argv);

		if (argv.dump) {
			// 設定値を表示する
			d(config);
		} else {
			// エディタで開く
			let config_js = `${lib.getRootDir()}/.genie/${argv.config}`;
			if (lib.isWindows()) {
				child.execSync(`start ${config_js}`);
			} else if (lib.isMac()) {
				child.execSync(`open ${config_js}`);
			}
		}
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],7:[function(require,module,exports) {

/**
 * ls: Dockerオブジェクト一覧
 * -----------------------------------------------------------------------------
 * ex. g ls
 *     g ls -l
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const color = require('cli-color');
const cliui = require('cliui')({ width: color.windowSize.width - 4 });

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// ランモード表示
		lib.showRunmode();

		// オプション設定
		let argv = option.usage('Usage: genie|g ls [Options]').options('long', {
			alias: 'l',
			describe: 'コンテナ一覧がもうちょっとだけ詳細に出ます'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		return new Promise(function (resolve, reject) {

			// 各種情報取得を並行して取得させる
			let funcs = [];
			let outputs = {};

			// docker-machine が使える環境の場合はそれも一覧する
			funcs.push(new Promise(function (ok, ng) {
				child.execFile('docker-machine', ['ls'], function (error, stdout, stderr) {
					error && ng();
					outputs['DockeMachines'] = stdout;
					ok();
				});
			}));

			// イメージ一覧
			funcs.push(new Promise(function (ok, ng) {
				child.execFile('docker', ['images'], function (error, stdout, stderr) {
					error && ng();
					outputs['Images'] = stdout;
					ok();
				});
			}));

			// データボリューム一覧
			funcs.push(new Promise(function (ok, ng) {
				child.execFile('docker', ['volume', 'ls', '--format', 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}'], function (error, stdout, stderr) {
					error && ng();
					outputs['Volumes'] = stdout;
					ok();
				});
			}));

			// コンテナ一覧
			funcs.push(new Promise(function (ok, ng) {
				let format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'];
				let header = ['NAMES', 'ID', 'IMAGE', 'STATUS', 'PORTS'];
				if (argv.long) {
					format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Labels}}'];
					header = ['NAMES', 'ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'LABELS'];
				}
				child.execFile('docker', ['ps', '-a', ...format], function (error, stdout, stderr) {
					error && ng();

					let lines = stdout.trim().split('\n');
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
					outputs['Containers'] = cliui.toString();
					ok();
				});
			}));

			// 出力
			Promise.all(funcs).then(function () {
				// DockerMachines
				console.log('\n  DockeMachines');
				lib.Message(outputs['DockeMachines'], 'primary', 1);

				// Images
				console.log('\n  Images');
				lib.Message(outputs['Images'], 'primary', 1);

				// Volumes
				console.log('\n  Volumes');
				lib.Message(outputs['Volumes'], 'primary', 1);

				// Containers
				console.log('\n  Containers');
				lib.Message(outputs['Containers'], 'primary', 1);

				resolve();
			}).catch(function (e) {
				return lib.Error(e);
			});
		});
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],8:[function(require,module,exports) {

/**
 * up: 設定に基づいてdockerを起動する
 * -----------------------------------------------------------------------------
 * ex. g up
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const color = require('cli-color');
const fs = require('fs');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g up [Options]').argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定ファイルロード
		let config = lib.loadConfig(argv);

		// ランモード表示
		lib.showRunmode();

		// 起動時メモの表示
		if (config.core.memo) {
			try {
				let memo = config.core.memo.up;
				if (memo) lib.Messages(memo);
			} catch (err) {
				Error('メモの設定が異常です。');
			}
		}

		return new Promise((() => {
			var _ref2 = _asyncToGenerator(function* (resolve, reject) {
				let cont_funcs = [];

				// 既存のコンテンツを先に終了させる（同モード＆同パス起動のコンテナ）
				yield lib.dockerDown(config);

				// PostgreSQL起動関数用意
				if (config.db.postgresql) {
					fs.chmodSync(`${config.root}/.genie/files/opt/postgresql/before-entrypoint.sh`, 0o755);
					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = Object.keys(config.db.postgresql)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							let key = _step.value;

							cont_funcs.push(lib.dockerUpPostgreSQL(key, config));
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
					fs.chmodSync(`${config.root}/.genie/files/opt/mysql/before-entrypoint.sh`, 0o755);
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = Object.keys(config.db.mysql)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							let key = _step2.value;

							cont_funcs.push(lib.dockerUpMySQL(key, config));
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

				// phpenvコンテナ起動関数用意
				if (config.lang.php.phpenv_image) {
					cont_funcs.push(lib.dockerUpPhpEnv(config));
				}

				// 先にDBやphpenvコンテナを並列起動開始
				Promise.all(cont_funcs).catch(function (err) {
					lib.Error(err);
				}).then(
				// DB全てdocker起動完了したらgenie本体を起動開始
				function () {
					return lib.dockerUp(config).catch(function (err) {
						return lib.Error(err);
					});
				});

				// 全コンテナで準備完了するまで、ステータスファイルを監視
				console.log();
				let count = 0;
				let done = {};
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

								let container_name = `${config.base_name}-postgresql-${key}`;
								if (done[container_name]) {
									line.push(`  ${container_name} ... ${color.green('ready!')}`);
								} else {
									let result = child.spawnSync('docker', ['exec', container_name, 'sh', '-c', 'ps aux|grep entrypoint.sh|grep -v grep|wc -l']);
									if (result.stdout.toString().trim() === '0') {
										done[container_name] = true;
										line.push(`  ${container_name} ... ${color.green('ready!')}`);
									} else if (process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]) {
										line.push(`  ${container_name} ... ${color.yellow('image downloading')}`);
									} else {
										line.push(`  ${container_name} ... ${color.yellow('loading')}`);
									}
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

								let container_name = `${config.base_name}-mysql-${key}`;
								if (done[container_name]) {
									line.push(`  ${container_name} ... ${color.green('ready!')}`);
								} else {
									let result = child.spawnSync('docker', ['logs', container_name]);
									let log = result.stdout.toString();
									if (log.match(/Initializing database/) && log.match(/MySQL init process done\. Ready for start up\./) || // ボリューム作成時
									!log.match(/Initializing database/) && log.match(/mysqld\: ready for connections\./) // ボリューム既存時
									) {
											done[container_name] = true;
											line.push(`  ${container_name} ... ${color.green('ready!')}`);
										} else if (process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]) {
										line.push(`  ${container_name} ... ${color.yellow('image downloading')}`);
									} else {
										line.push(`  ${container_name} ... ${color.yellow('loading')}`);
									}
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

					// phpenvコンテナ
					if (config.lang.php.phpenv_image) {
						let container_name = config.lang.php.phpenv_container_name;
						if (done[container_name]) {
							line.push(`  ${container_name} ... ${color.green('ready!')}`);
						} else {
							let result = child.spawnSync('docker', ['ps', '-qa', '--filter', `name=${container_name}`]);
							if (result.stdout.toString().trim().length) {
								done[container_name] = true;
								line.push(`  ${container_name} ... ${color.green('ready!')}`);
							} else if (process.env[`DOCKER_IMAGE_DOWN_LOADING_${container_name.toUpperCase()}`]) {
								line.push(`  ${container_name} ... ${color.yellow('image downloading')}`);
							} else {
								line.push(`  ${container_name} ... ${color.yellow('loading')}`);
							}
						}
					}

					// genie本体
					if (Object.keys(done).length !== line.length) {
						line.push(`  ${config.base_name} ... ${color.yellow('waiting')}`);
					} else {
						let result = child.spawnSync('docker', ['exec', config.base_name, 'cat', '/var/log/entrypoint.log']);
						let output = result.stdout.toString();
						if (output.match(/entrypoint\.sh setup done\./)) {
							done[config.base_name] = true;
							line.push(`  ${config.base_name} ... ${color.green('ready!')}`);
						} else if (output.match(/init\.sh setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('init.sh setup')}`);
						} else if (output.match(/Postfix setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('Postfix setup')}`);
						} else if (output.match(/Nginx setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('Nginx setup')}`);
						} else if (output.match(/Apache setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('Apache setup')}`);
						} else if (output.match(/Node.js setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('Node.js setup')}`);
						} else if (output.match(/Ruby setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('Ruby setup')}`);
						} else if (output.match(/PHP setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('PHP setup')}`);
						} else if (output.match(/Perl setup done\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('Perl setup')}`);
						} else if (output.match(/entrypoint\.sh setup start\./)) {
							line.push(`  ${config.base_name} ... ${color.yellow('loading')}`);
						} else {
							line.push(`  ${config.base_name} ... ${color.yellow('waiting')}`);
						}
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

					if (Object.keys(done).length !== line.length) {
						yield lib.sleep(100);
					}
				} while (Object.keys(done).length !== line.length);

				// ブラウザ起動
				if (config.http.browser.at_upped) yield CMDS.open(option);

				resolve();
			});

			return function (_x2, _x3) {
				return _ref2.apply(this, arguments);
			};
		})());
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],9:[function(require,module,exports) {

/**
 * down: 設定に基づいてdockerを終了する
 * -----------------------------------------------------------------------------
 * ex. g down
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g down [Options]').options('volumes', {
			alias: 'v',
			describe: '関連するVolumeも一緒に削除する'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定ファイルロード
		let config = lib.loadConfig(argv);

		// 終了時メモの表示
		if (config.core.memo) {
			try {
				let memo = config.core.memo.down;
				if (memo) lib.Messages(memo);
			} catch (err) {
				Error('メモの設定が異常です。');
			}
		}

		return new Promise((() => {
			var _ref2 = _asyncToGenerator(function* (resolve, reject) {
				yield Promise.all([lib.dockerDown(config, argv.v)]).catch(function (err) {
					return err;
				}).then(function () {
					resolve();
				});
			});

			return function (_x2, _x3) {
				return _ref2.apply(this, arguments);
			};
		})());
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],10:[function(require,module,exports) {

/**
 * cli: 起動中のコンテナ内でコマンドを実行する・コンテナのシェルに入る
 * -----------------------------------------------------------------------------
 * ex. g cli
 *     g cli ls -la
 *     g cli --host cont1 ls -la
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const path = require('path');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g cli [Options] [Commands]').options('host', {
			describe: '実行するホスト名を指定する'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定
		let config = lib.loadConfig(argv);
		let host = argv.host ? argv.host : config.core.docker.name;
		let cmds = process.argv.slice(process.argv.findIndex(function (elem) {
			return elem === argv._[1];
		})); // ちょっと強引だけど、デフォ引数を省いた位置から末尾までをコマンドラインとして取得する

		// dockerが起動しているか
		if (!lib.existContainers(config, '/' + host + '$')) lib.Error('dockerコンテナが起動していません: ' + host);

		// 引数があれば実行して結果を返す
		if (argv._.length !== 1) {
			let result = child.spawnSync('docker', ['exec', host, ...cmds]);
			if (result.status) {
				lib.Error(result.stderr.toString() || result.stdout.toString()); // dockerを通してるため stderr ではなく stdout 側にメッセージが流れてくる場合があるため
			} else {
				console.log(result.stdout.toString());
			}
		}

		// 引数が無ければコマンドラインに入る
		else {
				let login_path = '/';
				let current_dir = process.cwd();
				// ホスト側カレントディレクトリが .genie/～ 内ならゲスト内の同じ /genie/～ パスにログイン
				if (current_dir.indexOf(path.join(config.root, '.genie')) === 0) {
					login_path = path.relative(path.join(config.root, '.genie'), current_dir);
					login_path = path.posix.join('/genie', login_path);
				}

				// ホスト側カレントディレクトリが Apacheの公開ディレクトリ内（例えばpublic_html/～） 内ならゲスト内の同じ /var/www/html/～ パスにログイン
				if (config.http.apache && config.http.apache.enabled && current_dir.indexOf(path.join(config.root, config.http.apache.public_dir)) === 0) {
					login_path = path.relative(path.join(config.root, config.http.apache.public_dir), current_dir);
					login_path = path.posix.join('/var/www/html', login_path);
				}

				// いざログイン
				child.spawnSync('docker', ['exec', '-it', host, 'bash', '-c', `cd ${login_path} && bash`], { stdio: 'inherit' });
			}
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],11:[function(require,module,exports) {

/**
 * reject: 全てのdockerコンテナ・ボリュームを削除する
 * -----------------------------------------------------------------------------
 * ex. g reject
 *     g reject -f
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const inquirer = require('inquirer');
const color = require('cli-color');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g reject [Options]').options('force', {
			alias: 'f',
			describe: '選択肢を出さずにすぐに削除を開始する'
		}).options('locked', {
			alias: 'l',
			describe: '「locked_」から始まるボリューム・コンテナも対象にする'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
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
					checked: is_locked && !argv.locked ? false : true
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
					checked: is_locked && !argv.locked ? false : true
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
			return h('対象のオブジェクトはありませんでした。');
		}

		let answers;

		if (argv.force) {
			// 強制リストアップ
			let list = [...list_containers, ...list_volumes];
			answers = {};
			answers.rejects = [];
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					let item = _step3.value;

					item['checked'] && answers.rejects.push(item['name']);
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
		} else {
			// リスト選択
			console.log();
			answers = yield inquirer.prompt([{
				type: 'checkbox',
				message: '削除したいものにチェックを入れて Enter してください。',
				name: 'rejects',
				pageSize: 100,
				choices: [...list_containers, ...list_volumes]
			}]);
			if (!answers.rejects.length) return;

			// 画面クリア
			process.stdout.write(color.move.up(list_count));
			for (let i = 0; i < list_count; i++) {
				process.stdout.write(color.erase.line);
				process.stdout.write(color.move.down(1));
			}
			process.stdout.write(color.move.up(list_count));
		}

		// 削除対象のコンテナ名・ボリューム名をセット
		let name_volumes = [];
		let name_containters = [];
		var _iteratorNormalCompletion4 = true;
		var _didIteratorError4 = false;
		var _iteratorError4 = undefined;

		try {
			for (var _iterator4 = answers.rejects[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
				let label = _step4.value;

				label = color.strip(label);
				let matches = label.match(/^\[(Container|Volume)\] (.+)$/);
				if (matches[1] === 'Container') name_containters.push(matches[2]);else if (matches[1] === 'Volume') name_volumes.push(matches[2]);
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

		console.log();

		// コンテナ削除実行
		let funcs = [];
		var _iteratorNormalCompletion5 = true;
		var _didIteratorError5 = false;
		var _iteratorError5 = undefined;

		try {
			for (var _iterator5 = name_containters[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
				let name = _step5.value;

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

		// コンテナ削除実行
		funcs = [];
		var _iteratorNormalCompletion6 = true;
		var _didIteratorError6 = false;
		var _iteratorError6 = undefined;

		try {
			for (var _iterator6 = name_volumes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
				let name = _step6.value;

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
			_didIteratorError6 = true;
			_iteratorError6 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion6 && _iterator6.return) {
					_iterator6.return();
				}
			} finally {
				if (_didIteratorError6) {
					throw _iteratorError6;
				}
			}
		}

		yield Promise.all(funcs).catch(function (err) {
			lib.Error(err);
		});
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],12:[function(require,module,exports) {

/**
 * clean: 不要なdockerオブジェクトを削除する
 * -----------------------------------------------------------------------------
 * ex. g clean
 *     g clean -f
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const color = require('cli-color');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g clean [Options]').options('force', {
			alias: 'f',
			describe: 'lockedから始まる名前も対象にする'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		let cmd;
		let result;
		let count = 0;
		let funcs;

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
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],13:[function(require,module,exports) {

/**
 * build: 設定に基づいてイメージをビルドする
 * -----------------------------------------------------------------------------
 * ex. g build
 *     g build --no-cache
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const color = require('cli-color');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g build [Options]').options('no-cache', {
			alias: 'n',
			describe: 'キャッシュを使用せずにビルドする'
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定ファイルロード
		let config = lib.loadConfig(argv);

		// 確認
		let input = yield lib.Input(`${config.core.docker.image} イメージをビルドしてもよろしいでしょうか。[y/N]: `);

		// ビルド実行
		if (input.match(/^y$/i)) {
			let args = ['build', '-t', config.core.docker.image];
			if (argv['no-cache']) args.push('--no-cache');
			args.push(`${lib.getRootDir()}/.genie/image/`);
			lib.Message(`ビルドを開始します。\ndocker ${args.join(' ')}`, 'info');
			console.log();
			let stream = child.spawn('docker', args);
			stream.stdout.on('data', function (data) {
				console.log(color.blackBright(data.toString().trim()));
			});
			stream.stderr.on('data', function (data) {
				lib.Error(data);
			});
			stream.on('close', function (code) {
				let mes = 'ビルドが完了しました。';
				lib.Message(mes);
				lib.Say(mes);
			});
		}
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],14:[function(require,module,exports) {

/**
 * langver: 指定可能な各言語のバージョンを確認する
 * -----------------------------------------------------------------------------
 * ex. g langver
 *     g langver --perl
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g langver [Options] [Language]').argv;
		;
		let help_message = option.help() + '\n' + 'Language:\n' + '  php\n' + '  perl\n' + '  ruby\n' + '  node\n';
		if (argv.help || !argv._[1]) {
			console.log();
			return lib.Message(help_message, 'primary', 1);
		}

		// 各言語バージョンの表示
		if (argv._[1].match(/^php$/i)) {
			let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions']);
			lib.Message(result.stdout.toString(), 'primary');
		} else if (argv._[1].match(/^perl$/i)) {
			let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions']);
			lib.Message(result.stdout.toString(), 'primary');
		} else if (argv._[1].match(/^ruby$/i)) {
			let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions']);
			lib.Message(result.stdout.toString(), 'primary');
		} else if (argv._[1].match(/^node$/i)) {
			let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions']);
			lib.Message(result.stdout.toString(), 'primary');
		} else {
			console.log();
			lib.Message(help_message, 'primary', 1);
		}
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],15:[function(require,module,exports) {

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

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');
const rotate = require('log-rotate');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g mysql [Options]').options('cli', {
			alias: 'c',
			describe: 'MySQLコンテナのCLIに入る',
			boolean: true
		}).options('dump', {
			alias: 'd',
			describe: 'MySQLのダンプを取る',
			boolean: true
		}).options('restore', {
			alias: 'r',
			describe: 'MySQLのリストアを行う',
			boolean: true
		}).options('all', {
			alias: 'a',
			describe: '管轄全てのMySQLを対象とする。（--dump, --restore時のみ）',
			boolean: true
		}).options('no-rotate', {
			alias: 'n',
			describe: 'ダンプファイルのローテーションを行わない。（--dump時のみ）',
			boolean: true
		}).options('output-dir', {
			alias: 'o',
			describe: 'ダンプファイルの出力先を指定。（--dump時のみ、ホスト側のフルパス指定）'
		}).options('gzip', {
			alias: 'g',
			describe: 'ダンプファイルは圧縮。（--dump時に影響）',
			boolean: true
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定
		let config = lib.loadConfig(argv);
		if (!(config.db.mysql && Object.keys(config.db.mysql).length)) {
			lib.Error('MySQL設定がありません。');
		}

		// dockerが起動しているか
		if (!lib.existContainers(config, '/' + config.base_name + '$')) {
			lib.Error('dockerコンテナが起動していません: ' + config.base_name);
		}

		// --cli: MySQLコンテナの中に入る
		if (argv.cli) {
			let container_name = argv._[1] ? `${config.base_name}-mysql-${argv._[1]}` : yield get_target_containers(config, { is_single: true }, 'コマンドラインに入るMySQLコンテナを選択してください。');
			let key = get_key_from_container_name(config, container_name);
			child.spawnSync('docker', ['exec', '-it', container_name, 'bash'], { stdio: 'inherit' });
		}

		// --dump: ダンプを取る
		else if (argv.dump) {
				// 対象のコンテナを特定
				argv._.shift();

				// 対象キーを設定
				let keys = argv.all ? Object.keys(config.db.mysql) : argv._.length ? argv._ : yield get_target_containers(config, { has_all: true, is_key_return: true }, 'ダンプを取るMySQLコンテナを選択してください。');
				if (!Array.isArray(keys)) keys = [keys];

				// ダンプを保存するディレクトリが無ければ作成する
				let dump_dir = `${config.root}/.genie/files/opt/mysql/dumps`;
				if (argv.o) dump_dir = argv.o.replace(/\/$/, '');
				if (!fs.existsSync(dump_dir)) fs.mkdirSync(dump_dir, 0o755);

				// キーごとに回す
				let funcs = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						let key = _step.value;

						let container_name = `${config.base_name}-mysql-${key}`;
						funcs.push({
							label: container_name,
							proc: 'dumping',
							ok: 'dumped!',
							ng: 'failed!',
							func: new Promise((() => {
								var _ref2 = _asyncToGenerator(function* (ok, ng) {
									// キー名チェック
									if (!config.db.mysql[key]) ng('指定のキーのMySQL設定が定義されていません。' + key);
									let mysql = config.db.mysql[key];

									// ダンプファイルローテーション
									if (!argv.n) {
										let dump_file = `${dump_dir}/${key}.sql${argv.g ? '.gz' : ''}`;
										if (fs.existsSync(dump_file)) {
											yield new Promise(function (resolve, reject) {
												rotate(dump_file, { count: mysql.dump_genel + 1 }, function (err) {
													err ? reject(err) : resolve();
												});
											});
										}
									}

									// ダンプ用コンテナを起動する
									let run_docker = 'docker run -d' + ` --name ${container_name}-dumper` + ' -e MYSQL_ROOT_PASSWORD=1' + ` --link ${container_name}` + ` -v ${dump_dir}:/dumps/` + (config.core.docker.network ? ` --net=${config.core.docker.network}` : '') + (config.core.docker.options ? ` ${config.core.docker.options}` : '') + ` ${mysql.repository}` + ' mysqld' + (mysql.charset ? ` --character-set-server=${mysql.charset}` : '') + (mysql.collation ? ` --collation-server=${mysql.collation}` : '');
									child.execSync(run_docker);

									// ダンプ実行
									let exec_dump = 'docker exec' + ` ${container_name}-dumper` + ' sh -c' + ` "mysqldump --single-transaction -h ${container_name} -u${mysql.user} -p${mysql.pass} ${mysql.name} > /dumps/${key}.sql${argv.g ? '.gz' : ''}"`;
									child.exec(exec_dump, function (error, stdout, stderr) {
										child.exec(`docker rm -fv ${container_name}-dumper`);
										error && ng(error);
										ok();
									});
								});

								return function (_x2, _x3) {
									return _ref2.apply(this, arguments);
								};
							})())
						});
					}

					// 並列プログレス表示
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

				yield lib.para_progress(funcs);
			}

			// --restore: リストアする
			else if (argv.restore) {

					// 対象のコンテナを特定
					argv._.shift();

					// 対象キーを設定
					let keys = argv.all ? Object.keys(config.db.mysql) : argv._.length ? argv._ : yield get_target_containers(config, { has_all: true, is_key_return: true }, 'リストアするMySQLコンテナを選択してください。');
					if (!Array.isArray(keys)) keys = [keys];

					// リストア実行
					let funcs = [];
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							let key = _step2.value;

							let container_name = `${config.base_name}-mysql-${key}`;
							funcs.push({
								label: container_name,
								proc: 'restoring',
								ok: 'restored!',
								ng: 'failed!',
								func: new Promise(function (ok, ng) {

									// リストア用コマンドファイルをロード
									child.exec(`docker exec ${container_name} sh -c "cat /docker-run.cmd"`, function (error, stdout, stderr) {
										let reloader = stdout.toString().trim();
										error && ng(error);

										// 既存のコンテナを終了する
										let volume_container_name = get_volume_container_name(container_name);
										child.exec(`docker rm -f -v ${container_name}`, function (error, stdout, stderr) {
											error && ng(error);

											// ボリュームも消す（上記の-v指定で消えはずなのに消えないので・・）
											child.exec(`docker volume rm -f ${volume_container_name}`, function (error, stdout, stderr) {

												// 新たにコンテナを立ち上げる
												child.exec(reloader, function (error, stdout, stderr) {
													error && ng(error);

													// コンテナ直下に起動用コマンドを記録する（restore用）
													child.exec(`docker exec ${container_name} sh -c "echo '${reloader}' > /docker-run.cmd"`, function (error, stdout, stderr) {
														error && ng(error);

														// 特定の文字がログに出てくるまで待機
														let waiter = function waiter() {
															let log = child.execSync(`docker logs ${container_name}`);
															if (log.toString().match(/MySQL init process done\. Ready for start up\./)) {
																ok();
															} else {
																setTimeout(waiter, 100);
															}
														};
														setTimeout(waiter, 100);
													});
												});
											});
										});
									});
								})
							});
						}

						// 並列プログレス表示
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

					yield lib.para_progress(funcs);
				}

				// mysqlコマンドに入る
				else {
						let container_name = argv._[1] ? `${config.base_name}-mysql-${argv._[1]}` : yield get_target_containers(config, { is_single: true }, 'mysqlコマンドラインに入るMySQLコンテナを選択してください。');
						let key = get_key_from_container_name(config, container_name);
						if (!config.db.mysql[key]) lib.Error('指定のキーのMySQL設定が定義されていません。' + argv._[1]);
						child.spawnSync('docker', ['exec', '-it', container_name, 'mysql', config.db.mysql[key].name, `-u${config.db.mysql[key].user}`, `-p${config.db.mysql[key].pass}`], { stdio: 'inherit' });
					}
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();

/**
 * コンテナを選択させる
 */
function get_target_containers(config, option = {}, message) {
	// １つしかなければそれ
	if (Object.keys(config.db.mysql).length === 1) {
		return `${config.base_name}-mysql-${Object.keys(config.db.mysql)[0]}`;
	}

	// ２つ以上あれば選択肢
	return _asyncToGenerator(function* () {
		let key;
		let container_name;

		// 選択肢用意
		let list = [];
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = Object.keys(config.db.mysql)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				let name = _step3.value;

				list.push(`${name} (${config.base_name}-mysql-${name})`);
			}

			// 選択開始
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

		if (option.has_all) list.push('全て');
		console.log();
		let result = yield inquirer.prompt([{
			type: 'list',
			message: message,
			name: 'container',
			pageSize: 100,
			choices: list
		}]).catch(function (err) {
			lib.Error(err);
		});

		// 選択肢返却
		if (result.container === '全て') {
			return option.is_key_return ? Object.keys(config.db.mysql) : Object.keys(config.db.mysql).map(function (key) {
				return `${config.base_name}-mysql-${key}`;
			});
		} else {
			let matches = result.container.match(/^(\w+) /);
			return option.is_key_return ? matches[1] : `${config.base_name}-mysql-${matches[1]}`;
		}
	})();
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key;
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = Object.keys(config.db.mysql)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			let tmpkey = _step4.value;

			if (container_name === `${config.base_name}-mysql-${tmpkey}`) {
				key = tmpkey;
				break;
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

	return key;
}

/**
 * コンテナからボリューム名を取得
 */
function get_volume_container_name(container_name) {
	let volumes = child.execSync('docker volume ls -q');
	var _iteratorNormalCompletion5 = true;
	var _didIteratorError5 = false;
	var _iteratorError5 = undefined;

	try {
		for (var _iterator5 = volumes.toString().split(/\n/)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
			let volume = _step5.value;

			if (!volume) continue;else if (volume === container_name) return container_name;else if (volume === `locked_${container_name}`) return `locked_${container_name}`;
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

	return false;
}
},{"./libs.js":3}],16:[function(require,module,exports) {

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
const child = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');
const rotate = require('log-rotate');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g psql [Options]').options('cli', {
			alias: 'c',
			describe: 'PostgreSQLコンテナのCLIに入る',
			boolean: true
		}).options('dump', {
			alias: 'd',
			describe: 'PostgreSQLのダンプを取る',
			boolean: true
		}).options('restore', {
			alias: 'r',
			describe: 'PostgreSQLのリストアを行う',
			boolean: true
		}).options('all', {
			alias: 'a',
			describe: '管轄全てのPostgreSQLを対象とする。（--dump, --restore時のみ）',
			boolean: true
		}).options('no-rotate', {
			alias: 'n',
			describe: 'ダンプファイルのローテーションを行わない。（--dump時のみ）',
			boolean: true
		}).options('output-dir', {
			alias: 'o',
			describe: 'ダンプファイルの出力先を指定。（--dump時のみ、ホスト側のフルパス指定）'
		}).options('gzip', {
			alias: 'g',
			describe: 'ダンプファイルは圧縮。（--dump時に影響）',
			boolean: true
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定
		let config = lib.loadConfig(argv);
		if (!(config.db.postgresql && Object.keys(config.db.postgresql).length)) {
			lib.Error('PostgreSQL設定がありません。');
		}

		// dockerが起動しているか
		if (!lib.existContainers(config, '/' + config.base_name + '$')) {
			lib.Error('dockerコンテナが起動していません: ' + config.base_name);
		}

		// --cli: PostgreSQLコンテナの中に入る
		if (argv.cli) {
			let container_name = argv._[1] ? `${config.base_name}-postgresql-${argv._[1]}` : yield get_target_containers(config, { is_single: true }, 'コマンドラインに入るPostgreSQLコンテナを選択してください。');
			let key = get_key_from_container_name(config, container_name);
			child.spawnSync('docker', ['exec', '-it', container_name, 'bash'], { stdio: 'inherit' });
		}

		// --dump: ダンプを取る
		else if (argv.dump) {
				// 対象のコンテナを特定
				argv._.shift();

				// 対象キーを設定
				let keys = argv.all ? Object.keys(config.db.postgresql) : argv._.length ? argv._ : yield get_target_containers(config, { has_all: true, is_key_return: true }, 'ダンプを取るPostgreSQLコンテナを選択してください。');
				if (!Array.isArray(keys)) keys = [keys];

				// ダンプを保存するディレクトリが無ければ作成する
				let dump_dir = `${config.root}/.genie/files/opt/postgresql/dumps`;
				if (argv.o) dump_dir = argv.o.replace(/\/$/, '');
				if (!fs.existsSync(dump_dir)) fs.mkdirSync(dump_dir, 0o755);

				// キーごとに回す
				let funcs = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						let key = _step.value;

						let container_name = `${config.base_name}-postgresql-${key}`;
						funcs.push({
							label: container_name,
							proc: 'dumping',
							ok: 'dumped!',
							ng: 'failed!',
							func: new Promise((() => {
								var _ref2 = _asyncToGenerator(function* (ok, ng) {
									// キー名チェック
									if (!config.db.postgresql[key]) ng('指定のキーのPostgreSQL設定が定義されていません。' + key);
									let postgresql = config.db.postgresql[key];

									// ダンプファイルローテーション
									if (!argv.n) {
										let dump_file = `${dump_dir}/${key}.sql${argv.g ? '.gz' : ''}`;
										if (fs.existsSync(dump_file)) {
											yield new Promise(function (resolve, reject) {
												rotate(dump_file, { count: config.db.postgresql[key].dump_genel + 1 }, function (err) {
													err ? reject(err) : resolve();
												});
											});
										}
									}

									// ダンプ用コンテナを起動する
									let run_docker = 'docker run -d' + ` --name ${container_name}-dumper` + ` --link ${container_name}` + ` -v ${dump_dir}:/dumps/` + (config.core.docker.network ? ` --net=${config.core.docker.network}` : '') + (config.core.docker.options ? ` ${config.core.docker.options}` : '') + ` ${postgresql.repository}` + ' postgres';
									child.execSync(run_docker);

									// ダンプ実行前に.pgpassを保存（パスワード入力いらないように
									let exec_pgpass = 'docker exec' + ` ${container_name}-dumper` + ` sh -c "echo '${container_name}:5432:${postgresql.name}:${postgresql.user}:${postgresql.pass}' > /root/.pgpass && chmod 0600 /root/.pgpass"`;
									child.execSync(exec_pgpass);

									// ダンプ実行
									let exec_dump = 'docker exec' + ` ${container_name}-dumper` + ` sh -c "pg_dump ${postgresql.name} -U ${postgresql.user} -h ${container_name} | gzip > /dumps/${key}.sql${argv.g ? '.gz' : ''}"`;
									child.exec(exec_dump, function (error, stdout, stderr) {
										child.exec(`docker rm -fv ${container_name}-dumper`);
										error && ng(error);
										ok();
									});
								});

								return function (_x2, _x3) {
									return _ref2.apply(this, arguments);
								};
							})())
						});
					}

					// 並列プログレス表示
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

				yield lib.para_progress(funcs);
			}

			// --restore: リストアする
			else if (argv.restore) {

					// 対象のコンテナを特定
					argv._.shift();

					// 対象キーを設定
					let keys = argv.all ? Object.keys(config.db.postgresql) : argv._.length ? argv._ : yield get_target_containers(config, { has_all: true, is_key_return: true }, 'リストアするPostgreSQLコンテナを選択してください。');
					if (!Array.isArray(keys)) keys = [keys];

					// リストア実行
					let funcs = [];
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							let key = _step2.value;

							let container_name = `${config.base_name}-postgresql-${key}`;
							funcs.push({
								label: container_name,
								proc: 'restoring',
								ok: 'restored!',
								ng: 'failed!',
								func: new Promise(function (ok, ng) {

									// リストア用コマンドファイルをロード
									child.exec(`docker exec ${container_name} sh -c "cat /docker-run.cmd"`, function (error, stdout, stderr) {
										let reloader = stdout.toString().trim();
										error && ng(error);

										// 既存のコンテナを終了する
										let volume_container_name = get_volume_container_name(container_name);
										child.exec(`docker rm -f -v ${container_name}`, function (error, stdout, stderr) {
											error && ng(error);

											// ボリュームも消す（上記の-v指定で消えはずなのに消えないので・・）
											child.exec(`docker volume rm -f ${volume_container_name}`, function (error, stdout, stderr) {

												// 新たにコンテナを立ち上げる
												child.exec(reloader, function (error, stdout, stderr) {
													error && ng(error);

													// コンテナ直下に起動用コマンドを記録する（restore用）
													child.exec(`docker exec ${container_name} sh -c "echo '${reloader}' > /docker-run.cmd"`, function (error, stdout, stderr) {
														error && ng(error);

														// 特定の文字がログに出てくるまで待機
														let waiter = function waiter() {
															let ps = child.execSync(`docker exec ${container_name} sh -c "ps aux|grep entrypoint.sh|grep -v grep|wc -l"`);
															if (ps.toString().trim() == 0) {
																ok();
															} else {
																setTimeout(waiter, 100);
															}
														};
														setTimeout(waiter, 100);
													});
												});
											});
										});
									});
								})
							});
						}

						// 並列プログレス表示
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

					yield lib.para_progress(funcs);
				}

				// psqlコマンドに入る
				else {
						let container_name = argv._[1] ? `${config.base_name}-postgresql-${argv._[1]}` : yield get_target_containers(config, { is_single: true }, 'psqlコマンドラインに入るPostgreSQLコンテナを選択してください。');
						let key = get_key_from_container_name(config, container_name);
						if (!config.db.postgresql[key]) lib.Error('指定のキーのPostgreSQL設定が定義されていません。' + argv._[1]);
						child.spawnSync('docker', ['exec', '-it', container_name, 'psql', config.db.postgresql[key].name, '-U', config.db.postgresql[key].user], { stdio: 'inherit' });
					}
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();

/**
 * コンテナを選択させる
 */
function get_target_containers(config, option = {}, message) {
	// １つしかなければそれ
	if (Object.keys(config.db.postgresql).length === 1) {
		return `${config.base_name}-postgresql-${Object.keys(config.db.postgresql)[0]}`;
	}

	// ２つ以上あれば選択肢
	return _asyncToGenerator(function* () {
		let key;
		let container_name;

		// 選択肢用意
		let list = [];
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = Object.keys(config.db.postgresql)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				let name = _step3.value;

				list.push(`${name} (${config.base_name}-postgresql-${name})`);
			}

			// 選択開始
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

		if (option.has_all) list.push('全て');
		console.log();
		let result = yield inquirer.prompt([{
			type: 'list',
			message: message,
			name: 'container',
			pageSize: 100,
			choices: list
		}]).catch(function (err) {
			lib.Error(err);
		});

		// 選択肢返却
		if (result.container === '全て') {
			return option.is_key_return ? Object.keys(config.db.postgresql) : Object.keys(config.db.postgresql).map(function (key) {
				return `${config.base_name}-postgresql-${key}`;
			});
		} else {
			let matches = result.container.match(/^(\w+) /);
			return option.is_key_return ? matches[1] : `${config.base_name}-postgresql-${matches[1]}`;
		}
	})();
}

/**
 * コンテナ名からキー名を取得
 */
function get_key_from_container_name(config, container_name) {
	let key;
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = Object.keys(config.db.postgresql)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			let tmpkey = _step4.value;

			if (container_name === `${config.base_name}-postgresql-${tmpkey}`) {
				key = tmpkey;
				break;
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

	return key;
}

/**
 * コンテナからボリューム名を取得
 */
function get_volume_container_name(container_name) {
	let volumes = child.execSync('docker volume ls -q');
	var _iteratorNormalCompletion5 = true;
	var _didIteratorError5 = false;
	var _iteratorError5 = undefined;

	try {
		for (var _iterator5 = volumes.toString().split(/\n/)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
			let volume = _step5.value;

			if (!volume) continue;else if (volume === container_name) return container_name;else if (volume === `locked_${container_name}`) return `locked_${container_name}`;
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

	return false;
}
},{"./libs.js":3}],17:[function(require,module,exports) {

/**
 * open: 開く処理
 * -----------------------------------------------------------------------------
 * ex. g open           ... 設定されたブラウザでサイトを開く
 * ex. g open --site    ... 既定のブラウザで開発サイトを開く
 * ex. g open --report  ... 既定のブラウザでテストレポートを開く
 * ex. g open --maildev ... 既定のブラウザでmaildevページを開く
 * ex. g open --code    ... 管理フォルダをVisualStudioCodeで開く
 * ex. g open https://google.com
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');
const color = require('cli-color');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g open [Option|URL]').options('site', {
			alias: 's',
			describe: '既定のブラウザで開発サイトを開く',
			boolean: true
		}).options('report', {
			alias: 'r',
			describe: '既定のブラウザでテストレポートを開く',
			boolean: true
		}).options('maildev', {
			alias: 'm',
			describe: '既定のブラウザでMailDevページを開く',
			boolean: true
		}).options('code', {
			alias: 'c',
			describe: '管理フォルダをVisualStudioCodeで開く',
			boolean: true
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定
		let config = lib.loadConfig(argv);

		// 起動コマンド用意
		let opener = lib.isWindows() ? 'start' : lib.isMac ? 'open' : 'xdg-open';

		// URL指定
		argv._.shift();
		if (argv._.length) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = argv._[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					let url = _step.value;

					child.exec(`${opener} ${url}`);
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

		// --site指定
		if (argv.s) child.exec(`${opener} ${getWorkingUrl(config)}`);

		// --report指定
		if (argv.r) child.exec(`${opener} ${config.root}/tests-report/mochawesome-report/mochawesome.html`);

		// --maildev指定
		if (argv.l) child.exec(`${opener} ${getMailDevUrl(config)}`);

		// --code指定
		if (argv.c) child.exec(`code ${config.root}`);

		if (argv.s || argv.r || argv.l || argv.c || argv._.length) return;

		// 引数未指定（config.jsに設定されているブラウザで開く）
		let url = getWorkingUrl(config);
		let cmds = [];
		if (!(config.http.browser.apps && config.http.browser.apps.length)) config.http.browser.apps = [''];
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = config.http.browser.apps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				let app = _step2.value;

				let arg = '';
				if (lib.isWindows()) {
					if (app === 'chrome') arg = ' chrome';else if (app === 'firefox') arg = ' firefox'; // できなかった
					else if (app === 'ie') arg = ' explorer';else if (app === 'opera') arg = ' opera'; // 未確認
						else if (app) {
								arg = ` ${app}`;
							}
				} else {
					if (app === 'chrome') arg = ' -a "Google Chrome"';else if (app === 'firefox') arg = ' -a firefox';else if (app === 'safari') arg = ' -a safari';else if (app === 'opera') arg = ' -a opera'; // 未確認
					else if (app) {
							arg = ` -a ${app}`;
						}
				}
				cmds.push(`${opener}${arg} ${url}`);
			}

			// コマンド実行
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

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = cmds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				let cmd = _step3.value;

				child.execSync(cmd);
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
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();

/**
 * 開発中のURLを返す
 */
function getWorkingUrl(config) {

	// コンテナが起動してるかチェック
	if (!lib.existContainers(config, '/' + config.base_name + '$')) lib.Error('dockerコンテナが起動していません: ' + config.base_name);

	// 開発中のURLを用意
	let port = lib.get_external_port(config, config.http.browser.schema === 'https' ? 443 : 80);
	if (config.http.browser.schema === 'http' && port == 80 || config.http.browser.schema === 'https' && port == 443) {
		port = '';
	} else {
		port = `:${port}`;
	}
	let url = `${config.http.browser.schema}://${config.host_ip}${port}${config.http.browser.path}`;

	return url;
}

/**
 * MailDevのURLを返す
 */
function getMailDevUrl(config) {

	// コンテナが起動してるかチェック
	if (!lib.existContainers(config, '/' + config.base_name + '$')) lib.Error('dockerコンテナが起動していません: ' + config.base_name);

	// MailDevのURLを用意
	let port = lib.get_external_port(config, 9981);
	let url = `http://${config.host_ip}:${port}`;

	return url;
}
},{"./libs.js":3}],18:[function(require,module,exports) {

/**
 * logs: 起動中のコンテナのログを見る
 * -----------------------------------------------------------------------------
 * ex. g logs
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const child = require('child_process');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g logs [Options] [Commands]').argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定
		let config = lib.loadConfig(argv);

		// dockerが起動しているか
		if (!lib.existContainers(config, `/${config.base_name}$`)) lib.Error('dockerコンテナが起動していません: ' + config.base_name);

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
		child.spawnSync('docker', ['exec', '-it', config.base_name, 'multitail', ...args], { stdio: 'inherit' });
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],19:[function(require,module,exports) {

/**
 * dlsync: ダウンロードミラーリング
 * -----------------------------------------------------------------------------
 * ex. g dlsync
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const fs = require('fs');
const child = require('child_process');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g dlsync [Options]').argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}

		// 設定読み込み
		let config = lib.loadConfig(argv);

		if (!(config.trans.dlsync.remote_host && config.trans.dlsync.remote_user)) {
			lib.Error('dlsyncの設定情報がありません。');
		}

		// 保存先ディレクトリ作成
		let local_dir = `${config.root}/${config.trans.dlsync.local_dir}`;
		try {
			fs.accessSync(local_dir);
		} catch (e) {
			fs.mkdirSync(local_dir);
		}

		// 基本引数
		let args = [];
		args.push('run', '-d', '-it', '--rm');
		args.push('-e', 'TERM=xterm-256color');
		args.push('-e', 'LANG=ja_JP.UTF-8');
		args.push('-e', 'LC_ALL=ja_JP.UTF-8');
		args.push('-e', 'GENIE_PROC=dlsync');
		args.push('-v', `${local_dir}:/sync`);
		args.push('--label', `genie_runmode="${config.runmode}"`);
		args.push('--label', `genie_root="${config.root}"`);
		args.push(`--name=${config.base_name}-DLSYNC`);
		if (config.core.docker.network) args.push(`--net=${config.core.docker.network}`);
		if (config.core.docker.options) args.push(`${config.core.docker.options}`);

		// 設定値を環境変数値に
		let envs = lib.data2envs(config, 'GENIE');
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
			Error(result.stderr.toString());
		}

		// 完了
		lib.Say('ダウンロード同期が完了しました。');

		return;
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],20:[function(require,module,exports) {

/**
 * test: テストを実行
 * -----------------------------------------------------------------------------
 * ex. g test
 *     g test t
 *     g test --open
 *
 * このコマンドは`--mode`引数を指定しなければ、自動的に実行モードが 'test' になる。
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');
const fs = require('fs');
const child = require('child_process');
const inquirer = require('inquirer');
const color = require('cli-color');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// オプション設定
		let argv = option.usage('Usage: genie|g test [Options] [test paths/files]').options('mode', {
			alias: 'M',
			default: 'test',
			describe: '実行モードを指定可能（test時はデフォルト`test`）'
		}).options('open', {
			alias: 'o',
			describe: 'dockerホスト側のChromeブラウザを開きオートテストを実行する',
			boolean: true
		}).argv;
		;
		if (argv.help) {
			console.log();
			return lib.Message(option.help(), 'primary', 1);
		}
		// ランモードを環境変数にセット
		process.env.GENIE_RUNMODE = argv.mode;

		// 設定読み込み
		let config = lib.loadConfig(argv);

		// テストスクリプトがあるかチェック
		let test_dir = `${config.root}/tests/`;
		if (argv._[1]) test_dir = argv._[1];
		try {
			if (!fs.readdirSync(test_dir).length) throw new Error();
		} catch (err) {
			lib.Error(`${test_dir} にテストスクリプトを配置してください。`);
		}

		// テスト環境アップ
		yield CMDS.up(option);

		// カレントディレクトリを移動
		process.chdir(config.root);

		// ブラウザを実際に開くかどうかの引数を環境変数にセットする
		if (argv.o) process.env.GENIE_TEST_BROWSER_OPEN = 'on';

		// テスト前のコマンド実行
		if (config.test.before) child.execSync(config.test.before, { stdio: 'inherit' });

		// テストコマンド実行
		let result = child.execSync(config.test.run, { stdio: 'inherit' });

		// テスト後のコマンド実行
		if (config.test.after) child.execSync(config.test.after, { stdio: 'inherit' });

		// テスト環境ダウン
		yield CMDS.down(option);
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3}],41:[function(require,module,exports) {
module.exports = {
  "name": "genie-cmd",
  "description": "genie by node",
  "version": "0.0.40",
  "license": "MIT",
  "private": false,
  "bin": {
    "genie": "dist/genie",
    "g": "dist/genie"
  },
  "scripts": {
    "dev": "npx parcel watch src/genie.js --out-dir dist --out-file genie --target node --no-source-maps",
    "build": "npx parcel build src/genie.js --out-dir dist --out-file genie --target node --no-source-maps --no-cache && node src/build-after.js",
    "test": "npx mocha --recursive tests --reporter mochawesome --reporter-options reportDir=tests-report/mochawesome-report/,quiet=true & start chrome tests-report/mochawesome-report/mochawesome.html",
    "test-in-mac": "npx mocha --recursive tests --reporter mochawesome --reporter-options reportDir=tests-report/mochawesome-report,quiet=true,autoOpen=true"
  },
  "devDependencies": {
    "parcel-bundler": "^1.7.1"
  },
  "dependencies": {
    "cli-color": "^1.2.0",
    "cliui": "^4.1.0",
    "fs-extra": "^6.0.1",
    "inquirer": "^5.2.0",
    "jp-wrap": "^0.2.2",
    "log-rotate": "^0.2.8",
    "mocha": "^5.2.0",
    "mochawesome": "^3.0.2",
    "optimist": "^0.6.1",
    "string-width": "^2.1.1",
    "puptester": "^0.0.2"
  }
};
},{}],21:[function(require,module,exports) {

/**
 * version: genie-cmdのバージョンを表示する
 * -----------------------------------------------------------------------------
 * ex. g version
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const lib = require('./libs.js');

module.exports = (() => {
	var _ref = _asyncToGenerator(function* (option) {

		// ランモード表示
		lib.showRunmode();

		// バージョン表示
		var json = require('../package.json');
		process.stdout.write('\n');
		lib.Message(`${json.name} ver ${json.version}`, 'primary');
		process.stdout.write('\n');
	});

	return function (_x) {
		return _ref.apply(this, arguments);
	};
})();
},{"./libs.js":3,"../package.json":41}],1:[function(require,module,exports) {
///usr/bin/env node

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const option = require('optimist');
const lib = require('./libs.js');
global.d = lib.d;
global.h = lib.h;

// 時間計測開始
console.time('  Done');

/**
 * 各機能のファイルを読み込み
 * -----------------------------------------------------------------------------
 */
global.CMDS = {
	demo: option => {
		return require('./cmd-demo.js')(option);
	},
	init: option => {
		return require('./cmd-init.js')(option);
	},
	config: option => {
		return require('./cmd-config.js')(option);
	},
	ls: option => {
		return require('./cmd-ls.js')(option);
	},
	up: option => {
		return require('./cmd-up.js')(option);
	},
	down: option => {
		return require('./cmd-down.js')(option);
	},
	cli: option => {
		return require('./cmd-cli.js')(option);
	},
	reject: option => {
		return require('./cmd-reject.js')(option);
	},
	clean: option => {
		return require('./cmd-clean.js')(option);
	},
	build: option => {
		return require('./cmd-build.js')(option);
	},
	langver: option => {
		return require('./cmd-langver.js')(option);
	},
	mysql: option => {
		return require('./cmd-mysql.js')(option);
	},
	psql: option => {
		return require('./cmd-psql.js')(option);
	},
	open: option => {
		return require('./cmd-open.js')(option);
	},
	// ngrok:     option=>{return require('./cmd-ngrok.js')(option)},
	logs: option => {
		return require('./cmd-logs.js')(option);
	},
	dlsync: option => {
		return require('./cmd-dlsync.js')(option);
	},
	test: option => {
		return require('./cmd-test.js')(option);
	},
	version: option => {
		return require('./cmd-version.js')(option);
	}

	/**
  * 標準引数定義
  * -----------------------------------------------------------------------------
  */
};let argv = option.usage('Usage: genie|g [Commands] [Options]').options('mode', {
	alias: 'M',
	default: 'develop',
	describe: '実行モードを指定可能'
}).options('config', {
	alias: 'C',
	default: 'config.js',
	describe: '設定ファイルを指定可能'
}).options('help', {
	alias: 'h',
	describe: '説明表示'
}).argv;

// ランモードを環境変数にセット（すでにGENIE_RUNMODEが用意されてる環境ならそっちを優先する。※test時を除く）
if (!process.env.GENIE_RUNMODE) process.env.GENIE_RUNMODE = argv.mode;

~_asyncToGenerator(function* () {

	/**
 * 各コマンド機能を実行する
 * -----------------------------------------------------------------------------
 */
	let cmd = argv._.shift();
	if (cmd === 'demo') yield CMDS.demo(option);else if (cmd === 'init') yield CMDS.init(option);else if (cmd === 'config') yield CMDS.config(option);else if (cmd === 'ls') yield CMDS.ls(option);else if (cmd === 'up') yield CMDS.up(option);else if (cmd === 'down') yield CMDS.down(option);else if (cmd === 'cli') yield CMDS.cli(option);else if (cmd === 'reject') yield CMDS.reject(option);else if (cmd === 'clean') yield CMDS.clean(option);else if (cmd === 'build') yield CMDS.build(option);else if (cmd === 'langver') yield CMDS.langver(option);else if (cmd === 'mysql') yield CMDS.mysql(option);else if (cmd === 'psql') yield CMDS.psql(option);else if (cmd === 'open') yield CMDS.open(option);
	// else if(cmd==='ngrok')   await CMDS.ngrok(option)
	else if (cmd === 'logs') yield CMDS.logs(option);else if (cmd === 'dlsync') yield CMDS.dlsync(option);else if (cmd === 'httpd') yield CMDS.httpd(option);else if (cmd === 'test') yield CMDS.test(option);else if (cmd === 'version') yield CMDS.version(option);

		/**
   * help
   * -----------------------------------------------------------------------------
   */
		else {
				console.log();
				lib.Message(option.help() + '\n' + 'Commands:\n' + '  init      現在のディレクトリに .genie/ を作成します。\n' + '  config    設定を確認する\n' + '  ls        Dockerコンテナ状況を確認する\n' + '  up        設定に基づきDockerコンテナを起動する\n' + '  down      関連するコンテナのみ終了する\n' + '  update    \n' + '  cli       コンテナ内でコマンドを実行。またはコンテナに入る\n' + '  reject    genie対象外のコンテナまたはボリュームを一括削除する\n' + '  clean     不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n' + '  build     基本のdockerイメージをビルドする\n' + '  langver   各種言語の利用可能なバージョンを確認する\n' + '  mysql     MySQLを操作する\n' + '  psql      PostgreSQLを操作する\n' + '  open      ブラウザで開く\n' + '  ngrok     \n' + '  logs      実行ログを見る\n' + '  dlsync    FTPを利用したダウンロード方向のみのミラーリングを実行する\n' + '  httpd     \n' + '  test      \n' + '  demo      デモ\n', '  version   バージョン表示\n', 'warning', 1);
			}

	// done.
	process.stdout.write('\n');
	console.timeEnd('  Done');
	process.stdout.write('\n');
})();
},{"./libs.js":3,"./cmd-demo.js":4,"./cmd-init.js":5,"./cmd-config.js":6,"./cmd-ls.js":7,"./cmd-up.js":8,"./cmd-down.js":9,"./cmd-cli.js":10,"./cmd-reject.js":11,"./cmd-clean.js":12,"./cmd-build.js":13,"./cmd-langver.js":14,"./cmd-mysql.js":15,"./cmd-psql.js":16,"./cmd-open.js":17,"./cmd-logs.js":18,"./cmd-dlsync.js":19,"./cmd-test.js":20,"./cmd-version.js":21}]},{},[1], null)