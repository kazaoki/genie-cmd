
/**
 * langver: 指定可能な各言語のバージョンを確認する
 * -----------------------------------------------------------------------------
 * ex. g langver
 *     g langver --perl
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g langver [Options] [Language]')
		.argv;
	;
	let help_message =
		option.help()+'\n'+
		'Language:\n'+
		'  php\n'+
		'  perl\n'+
		'  ruby\n'+
		'  node\n'
	;
	if(argv.help) {
		console.log()
		return lib.Message(help_message, 'primary', 1);
	}

	// 各言語バージョンの表示
	if(argv._[1].match(/^php$/i)) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv._[1].match(/^perl$/i)) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv._[1].match(/^ruby$/i)) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv._[1].match(/^node$/i)) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else {
		console.log()
		lib.Message(help_message, 'primary', 1)
	}
};
