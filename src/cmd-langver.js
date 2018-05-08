
/**
 * langver: 指定可能な各言語のバージョンを確認する
 * -----------------------------------------------------------------------------
 * ex. g langver
 *     g langver --perl
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g langver [Options]')
		.options('php', {describe: 'PHPの利用可能なバージョン一覧を表示'})
		.options('perl', {describe: 'Perlの利用可能なバージョン一覧を表示'})
		.options('ruby', {describe: 'Rubyの利用可能なバージョン一覧を表示'})
		.options('node', {describe: 'Node.jsの利用可能なバージョン一覧を表示'})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 各言語バージョンの表示
	if(argv.php) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/phpenv/plugins/php-build/bin/php-build --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.perl) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/plenv/plugins/perl-build/perl-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.ruby) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else if(argv.node) {
		let result = child.spawnSync('docker', ['run', '--rm', '--entrypoint=bash', 'kazaoki/genie', '-c', '/root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build  --definitions'])
		lib.Message(result.stdout.toString(), 'primary')
	} else {
		console.log()
		lib.Message(option.help(), 'primary', 1)
	}

	process.exit();
};
