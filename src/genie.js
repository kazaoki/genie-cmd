#!/usr/bin/env node

import { isWindows } from './libs.js';

'use strict'

const opt = require('optimist')
const lib = require('./libs.js');

let argv = opt
	.usage('Usage: genie|g [Commands] [Options]')
	.options('mode', {
		alias: 'm',
		default: '',
		describe: '実行モードを指定可能'
	})
	.options('config', {
		alias: 'c',
		default: 'config.js',
		describe: '設定ファイルを指定可能'
	})
	.options('help', {
		alias: 'h',
		describe: '説明表示'
	})
	.argv
;


/**
 * demo
 * -------------------------------------------------------------------
 */
if(argv._.includes('demo'))
{
	(async function(){

		// メッセージBOX
		console.log();
		lib.Message('サンプル：default', 'default')
		lib.Message('サンプル：primary', 'primary')
		lib.Message('サンプル：success', 'success')
		lib.Message('サンプル：danger', 'danger')
		lib.Message('サンプル：warning', 'warning')
		lib.Message('サンプル：info', 'info')
		lib.Message('改行込み、1ライン入れも可能。\ntest1\ntest2\ntest3', 'default', 1)

		// 入力BOX
		let input = await lib.Input('入力BOX（入力文字を発音しますのでご注意）：', 20);
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
else if(argv._.includes('clean'))
{
	// オプション設定
	let argv = opt
		.usage('Usage: genie|g clean [Options]')
		.options('locked', {
			alias: 'l',
			describe: '`locked`を含むDataVolumeも削除'
		})
		.argv;
	;
	if(argv.help) opt.showHelp()

	process.exit();
}
/**
 * help
 * -------------------------------------------------------------------
 */
else
{
	console.error(
		opt.help()+'\n'+
		'Commands:\n'+
		'  init    \n'+
		'  config  \n'+
		'  ls      \n'+
		'  up      \n'+
		'  down    \n'+
		'  update  \n'+
		'  cli     \n'+
		'  reject  \n'+
		'  clean   \n'+
		'  build   \n'+
		'  php     \n'+
		'  perl    \n'+
		'  ruby    \n'+
		'  mysql   \n'+
		'  psql    \n'+
		'  open    \n'+
		'  ngrok   \n'+
		'  logs    \n'+
		'  dlsync  \n'+
		'  httpd   \n'+
		'  spec    \n'+
		'  zap     \n'+
		'  demo     デモするよ！\n'
	);

	process.exit();
}
