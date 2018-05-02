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
})({3:[function(require,module,exports) {

'use strict';

const stringWidth = require('string-width');
const cliColor = require('cli-color');
const readline = require('readline').createInterface(process.stdin, process.stdout);
const fs = require('fs');
const childProcess = require('child_process');

/**
 * Repeat
 * @param {string} string 繰り返したい文字
 * @param {number} times 繰り返したい回数
 * @return {string} 繰り返した文字列
 * -----------------------------------------------------------------------------
 */
//  module.exports.Repeat = (string, times=1)=>{
const Repeat = module.exports.Repeat = (string, times = 1) => {
	if (!times > 0) return '';
	var lump = '';
	for (var i = 0; i < times; i++) {
		lump += string;
	}
	return lump;
};

/**
 * Message
 * @param {string} message 表示したいメッセージ。改行込み複数行対応。
 * @param {string} type タイプ。primary|success|danger|warning|info|default
 * @param {number} line タイトル線を引く位置。
 */
const Message = module.exports.Message = (message, type = 'default', line = 0) => {
	var indent = '  ';
	var line_color = cliColor.white;
	var fg_color = cliColor.white;
	if (type === 'primary') {
		line_color = cliColor.xterm(26);
		fg_color = cliColor.xterm(39);
	} else if (type === 'success') {
		line_color = cliColor.green;
		fg_color = cliColor.greenBright;
	} else if (type === 'danger') {
		line_color = cliColor.red;
		fg_color = cliColor.redBright;
	} else if (type === 'warning') {
		line_color = cliColor.yellow;
		fg_color = cliColor.yellowBright;
	} else if (type === 'info') {
		line_color = cliColor.whiteBright;
		fg_color = cliColor.whiteBright;
	}

	var messages = message.split(/[\r\n]+/);
	var length = 0;
	for (var i in messages) {
		var len = stringWidth(messages[i]);
		if (length < len) length = len;
	}
	length += 2;

	console.log(indent + line_color('┏') + line_color(Repeat('─', length)) + line_color('┓'));
	for (var i in messages) {
		if (line > 0 && line == i) {
			console.log(indent + line_color('┣') + line_color(Repeat('─', length)) + line_color('┫'));
		}
		console.log(indent + line_color('│') + fg_color(' ' + messages[i] + ' ') + Repeat(' ', length - 2 - stringWidth(messages[i])) + line_color('│'));
	}
	console.log(indent + line_color('┗') + line_color(Repeat('─', length)) + line_color('┛'));
};

/**
 * Input
 * @param {string} message 入力を促す表示メッセージ
 * @param {number} tail_space 背景BOXの長さを追加する文字数
 * @return {string} 入力値
 */
const Input = module.exports.Input = (message, tail_space = 20) => {
	var indent = cliColor.bgBlack('  ');
	message = '  ' + message + '  ';
	var len = stringWidth(message) + tail_space;
	var fg = cliColor.whiteBright.bgBlueBright;
	var bg = cliColor.bgBlue;
	console.log('\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + fg(message + Repeat(' ', tail_space)) + '\n' + indent + fg(Repeat(' ', len)) + '\n' + indent + bg(Repeat(' ', len)));
	process.stdout.write(cliColor.move.up(3));
	process.stdout.write(cliColor.move.right(len - tail_space));
	return new Promise(result => {
		readline.on('line', input => {
			process.stdout.write(cliColor.move.down(3));
			result(input);
		});
	});
};

/**
 * isWindows
 * @return {boolean} Windowsかどうか
 */
const isWindows = module.exports.isWindows = () => {
	return process.platform === 'win32';
};

/**
 * isMac
 * @return {boolean} MacOSかどうか
 */
const isMac = module.exports.isMac = () => {
	return process.platform === 'darwin';
};

/**
 * Say
 * @param {string} message スピーチする文字列
 */
const Say = module.exports.Say = message => {
	// Macの場合はsayコマンド
	if (isMac()) {
		childProcess.execSync(`say -r 300 "${message}"`);
	}
	// Windowsの場合はwscriptスクリプトをtempに用意してから実行（最後は削除する）
	else if (isWindows()) {
			let temp_dir = fs.mkdtempSync(process.env.TEMP + '/genie-say-');
			let temp_file = temp_dir + '/say.js';
			fs.writeFileSync(temp_file, `var args = [];for(var i = 0; i < WScript.Arguments.length; i++) args.push(WScript.Arguments.Item(i));WScript.CreateObject('SAPI.SpVoice').Speak('<volume level="100">'+'<rate speed="2">'+'<pitch middle="0">'+args.join(' ')+'</pitch>'+'</rate>'+'</volume>', 8);`);
			childProcess.execSync(`start wscript ${temp_file} "${message}"`);
			fs.unlinkSync(temp_file);
			fs.rmdirSync(temp_dir);
		}
};
},{}],1:[function(require,module,exports) {
'use strict';

var _libs = require('./libs.js');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } ///usr/bin/env node

'use strict';

const opt = require('optimist');
const lib = require('./libs.js');

let argv = opt.usage('Usage: genie|g [Commands] [Options]').options('mode', {
	alias: 'm',
	default: '',
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
 * demo
 * -------------------------------------------------------------------
 */
if (argv._.includes('demo')) {
	_asyncToGenerator(function* () {

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

		// エラー終了
		throw new Error('エラーテスト');

		// process.exit();
	})();
}
/**
 * clean
 * -------------------------------------------------------------------
 */
else if (argv._.includes('clean')) {
		// オプション設定
		let argv = opt.usage('Usage: genie|g clean [Options]').options('locked', {
			alias: 'l',
			describe: '`locked`を含むDataVolumeも削除'
		}).argv;
		;
		if (argv.help) opt.showHelp();

		process.exit();
	}
	/**
  * help
  * -------------------------------------------------------------------
  */
	else {
			console.error(opt.help() + '\n' + 'Commands:\n' + '  init    \n' + '  config  \n' + '  ls      \n' + '  up      \n' + '  down    \n' + '  update  \n' + '  cli     \n' + '  reject  \n' + '  clean   \n' + '  build   \n' + '  php     \n' + '  perl    \n' + '  ruby    \n' + '  mysql   \n' + '  psql    \n' + '  open    \n' + '  ngrok   \n' + '  logs    \n' + '  dlsync  \n' + '  httpd   \n' + '  spec    \n' + '  zap     \n' + '  demo     デモするよ！\n');

			process.exit();
		}
},{"./libs.js":3}]},{},[1])