
/**
 * dlsync: ダウンロードミラーリング
 * -----------------------------------------------------------------------------
 * ex. g dlsync
 */

'use strict'

const lib = require('./libs.js')
const fs = require('fs')
const child = require('child_process')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g dlsync [Options]')
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定読み込み
	let config = lib.loadConfig(argv)

	if(!(config.trans.dlsync.remote_host && config.trans.dlsync.remote_user)) {
		lib.Error('dlsyncの設定情報がありません。')
	}

	// 保存先ディレクトリ作成
	let local_dir = `${config.root}/${config.trans.dlsync.local_dir}`;
	try{fs.accessSync(local_dir)}catch(e){fs.mkdirSync(local_dir)}

	// 基本引数
	let args = [];
	args.push('run', '--rm')
	args.push('-e', 'TERM=xterm-256color')
	args.push('-e', 'LANG=ja_JP.UTF-8')
	args.push('-e', 'LC_ALL=ja_JP.UTF-8')
	args.push('-e', 'GENIE_PROC=dlsync')
	args.push('-v', `${local_dir}:/sync`)
	args.push('--label', `genie_runmode="${config.runmode}"`)
	args.push('--label', `genie_root="${config.root}"`)
	args.push(`--name=${config.base_name}-DLSYNC`)
	if(config.core.docker.network) args.push(`--net=${config.core.docker.network}`)
	if(config.core.docker.options) args.push(`${config.core.docker.options}`)

	// 設定値を環境変数値に
	let envs = lib.data2envs(config, 'GENIE')
	envs.GENIE_RUNMODE=config.runmode;
	let keys = Object.keys(envs)
	for(let i=0; i<keys.length; i++) {
		args.push('-e', `${keys[i]}=${envs[keys[i]]}`)
	}

	// イメージ指定
	args.push(config.core.docker.image)

	// dockerコマンド実行
	let result = child.spawnSync('docker', args, {
		cwd: process.cwd(),
		env: process.env,
		stdio: 'inherit',
		encoding: 'utf-8'
	})
	if(result.status) {
		Error(result.stderr.toString())
	}

	// 完了
	lib.Say('ダウンロード同期が完了しました。')

	return;

}
