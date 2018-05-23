
/**
 * down: 設定に基づいてdockerを終了する
 * -----------------------------------------------------------------------------
 * ex. g down
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g down [Options]')
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 終了時メモの表示
	try {
		let memo = config.core.memo.down
		if(memo) lib.Messages(memo);
	} catch(err) {
		Error('メモの設定が異常です。')
	}

	(async()=>
	{
		await Promise.all([
			// lib.dockerDown('/'+config.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
			// lib.dockerDown('/'+config.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
			// lib.dockerDown('/'+config.base_name+'$', config), // 完全一致のgenie本体コンテナ名
			lib.dockerDown(null, config), // ルートパスとランモードが一致するもの（＝ゴミコンテナ）削除
		]).catch(err=>err)
		.then(()=>{
			h('DONE!')
			process.exit();
		})
	})();
};
