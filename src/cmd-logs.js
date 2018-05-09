
/**
 * logs: 起動中のコンテナのログを見る
 * -----------------------------------------------------------------------------
 * ex. g logs
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g logs [Options] [Commands]')
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 設定
	let config = lib.loadConfig(argv);

	// dockerが起動しているか
	if(!lib.existContainers(config, `/${config.run.base_name}$`)) lib.Error('dockerコンテナが起動していません: '+docker.run.base_name)

	// コマンド用意
	let args = [];
	try{
		if(!(config.log.tail && config.log.tail[0] && config.log.tail[0].length)) throw new Error('ログ設定が正しくありません。')

		// 横分割設定（グループが２つ以上の場合）
		if(config.log.tail.length>1) {
			args.push('-s', '2')
		}

		// ファイル設定
		for(let files of config.log.tail){
			let is_first = true
			for(let file of files) {
				if(typeof(file)==='object' && Array.isArray(file)) {
					args.push('-ci', file[1])
					if(!is_first) args.push('-I')
					args.push(file[0])
				} else if(typeof(file)==='string') {
					if(!is_first) args.push('-I')
					args.push(file)
				} else {
					throw new Error('ログ設定が正しくない可能性があります。（指定できるのは文字列か配列のみです）'+file)
				}
				is_first = false
			}
		}
	} catch(err) {
		lib.Error(err);
	}

	// multitail実行
	child.spawnSync('docker', ['exec', '-it', config.run.base_name, 'multitail', ...args], {stdio: 'inherit'})

	process.exit()

};
