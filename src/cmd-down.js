
/**
 * down: 設定に基づいてdockerを終了する
 * -----------------------------------------------------------------------------
 * ex. g down
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g down [Options]')
		.options('volumes', {
			alias: 'v',
			describe: '関連するVolumeも一緒に削除する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 終了時メモの表示
	if(config.core.memo) {
		try {
			let memo = config.core.memo.down
			if(memo) lib.Messages(memo);
		} catch(err) {
			Error('メモの設定が異常です。')
		}
	}

	return new Promise(async (resolve, reject)=>
	{
		await Promise.all([
			lib.dockerDown(config, argv.v),
		]).catch(err=>err)
		.then(()=>{
			resolve()
		})
	})
};
