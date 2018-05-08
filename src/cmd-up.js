
/**
 * up: 設定に基づいてdockerを起動する
 * -----------------------------------------------------------------------------
 * ex. g up
 *     g up -s
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g up [Options]')
		.options('shadow', {
			alias: 's',
			describe: 'データをマウントではなくコンテナにコピーした別のコンテナを起動する'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 起動時メモの表示
	try {
		let memo = config.core.memo.up
		if(memo) lib.Messages(memo);
	} catch(err) {
		Error('メモの設定が異常です。')
	}

	(async()=>
	{
		// 各コンテナ終了
		if(lib.existContainers(config)) {
			// h('対象の既存コンテナのみ削除します', color.blackBright);
			await Promise.all([
				lib.dockerDown('/'+config.run.base_name+'-postgresql', config), // 前方一致のPostgreSQLコンテナ名
				lib.dockerDown('/'+config.run.base_name+'-mysql', config), // 前方一致のMySQLコンテナ名
				lib.dockerDown('/'+config.run.base_name+'$', config), // 完全一致のgenie本体コンテナ名
				lib.dockerDown(null, config), // プロジェクトパスとshadowが一致するもの（＝ゴミコンテナ）削除
			]).catch(err=>err)
		}

		let rundb_fucs = []

		// PostgreSQL起動関数用意
		try {
			let keys = Object.keys(config.db.postgresql)
			if(keys.length) {
				// h('PostgreSQL起動開始')
				rundb_fucs.push(lib.dockerUp('postgresql', config))
			}
		} catch(err) { Error(err) }

		// MySQL起動関数用意
		try {
			let keys = Object.keys(config.db.mysql)
			if(keys.length) {
				// h('MySQL起動開始')
				rundb_fucs.push(lib.dockerUp('mysql', config))
			}
		} catch(err) { Error(err) }

		// 先にDBを起動開始
		await Promise.all(rundb_fucs).catch(err=>{lib.Error(err)})

		// genie本体起動関数用意
		// h('genie本体起動開始')
		await lib.dockerUp('genie', config).catch(err=>lib.Error(err))

		// ブラウザ起動
		;

		h('起動完了!!')
		process.exit();
	})();
};
