
/**
 * cli: 起動中のコンテナ内でコマンドを実行する・コンテナのシェルに入る
 * -----------------------------------------------------------------------------
 * ex. g cli
 *     g cli ls -la
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g cli [Options] [Commands]')
		.options('host', {
			describe: '実行するホスト名を指定する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 設定
	let config = lib.loadConfig(argv);
	let host = argv.host ? argv.host : config.core.docker.name
	let cmds = process.argv.slice(process.argv.findIndex(elem=>elem===argv._[1])) // ちょっと強引だけど、デフォ引数を省いた位置から末尾までをコマンドラインとして取得する

	// dockerが起動しているか
	if(!lib.existContainers(config, '/'+host+'$')) lib.Error('dockerコンテナが起動していません: '+host)

	// 引数があれば実行して結果を返す
	if(argv._.length!==1) {
		let result = child.spawnSync('docker', ['exec', host, ...cmds]);
		if(result.status) {
			lib.Error(result.stderr.toString() || result.stdout.toString()) // dockerを通してるため stderr ではなく stdout 側にメッセージが流れてくる場合があるため
			process.exit()
		}
		console.log(result.stdout.toString())
		process.exit()
	}

	// 引数が無ければコマンドラインに入る
	else {
		child.spawnSync('docker', ['exec', '-it', host, 'bash'], {stdio: 'inherit'})
		process.exit()
	}
};
