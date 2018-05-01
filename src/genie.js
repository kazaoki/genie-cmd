#!/usr/bin/env node

'use strict'

const opt = require('optimist')
const lib = require('./libs.js');
const Message = lib.Message;
const Repeat = lib.Repeat;
const Input = lib.Input;

var argv = opt
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
		Message('サンプル：default', 'default')
		Message('サンプル：primary', 'primary')
		Message('サンプル：success', 'success')
		Message('サンプル：danger', 'danger')
		Message('サンプル：warning', 'warning')
		Message('サンプル：info', 'info')
		Message('改行込み、1ライン入れも可能。\ntest1\ntest2\ntest3', 'default', 1)

		// 入力BOX
		var input = await Input('入力BOX（入力文字を発音しますのでご注意）：', 20);
		Message('入力された文字：' + input);

		// sayテスト
		// say($input);

		// エラー終了
		// throw('エラーテスト', '終了ステータス1で終わります');

		process.exit();

	})();

}
/**
 * clean
 * -------------------------------------------------------------------
 */
else if(argv._.includes('clean'))
{
	// オプション設定
	var argv = opt
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
