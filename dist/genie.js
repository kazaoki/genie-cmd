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
})({1:[function(require,module,exports) {
///usr/bin/env node

'use strict';

const lib = require('./libs.js');
const option = require('optimist');

/**
 * 標準引数定義
 * -----------------------------------------------------------------------------
 */
let argv = option.usage('Usage: genie|g [Commands] [Options]').options('mode', {
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
// ランモードを環境変数にセット
process.env.GENIE_RUNMODE = argv.mode;

/**
* 各コマンド機能を実行する
* -----------------------------------------------------------------------------
*/
let cmd = argv._.shift();
if (cmd === 'demo') require('./cmd-demo.js')(option);
// else if(cmd==='init')    require('./cmd-init.js')(option)
else if (cmd === 'config') require('./cmd-config.js')(option);else if (cmd === 'ls') require('./cmd-ls.js')(option);else if (cmd === 'up') require('./cmd-up.js')(option);else if (cmd === 'down') require('./cmd-down.js')(option);else if (cmd === 'cli') require('./cmd-cli.js')(option);else if (cmd === 'reject') require('./cmd-reject.js')(option);else if (cmd === 'clean') require('./cmd-clean.js')(option);else if (cmd === 'build') require('./cmd-build.js')(option);else if (cmd === 'langver') require('./cmd-langver.js')(option);else if (cmd === 'mysql') require('./cmd-mysql.js')(option);else if (cmd === 'psql') require('./cmd-psql.js')(option);else if (cmd === 'open') require('./cmd-open.js')(option);
	// else if(cmd==='ngrok')   require('./cmd-ngrok.js')(option)
	else if (cmd === 'logs') require('./cmd-logs.js')(option);
		// else if(cmd==='dlsync')  require('./cmd-dlsync.js')(option)
		else if (cmd === 'test') require('./cmd-test.js')(option);

			/**
    * help
    * -----------------------------------------------------------------------------
    */
			else {
					console.log();
					lib.Message(option.help() + '\n' + 'Commands:\n' + '  init      \n' + '  config    設定を確認する\n' + '  ls        Dockerコンテナ状況を確認する\n' + '  up        設定に基づきDockerコンテナを起動する\n' + '  down      関連するコンテナのみ終了する\n' + '  update    \n' + '  cli       コンテナ内でコマンドを実行。またはコンテナに入る\n' + '  reject    genie対象外のコンテナまたはボリュームを一括削除する\n' + '  clean     不要なイメージ・終了済みコンテナ・リンクされてないボリュームを一括削除する\n' + '  build     基本のdockerイメージをビルドする\n' + '  langver   各種言語の利用可能なバージョンを確認する\n' + '  mysql     MySQLを操作する\n' + '  psql      PostgreSQLを操作する\n' + '  open      ブラウザで開く\n' + '  ngrok     \n' + '  logs      実行ログを見る\n' + '  dlsync    \n' + '  httpd     \n' + '  test      \n' + '  demo      デモ\n', 'warning', 1);
					process.exit();
				}
},{}]},{},[1])