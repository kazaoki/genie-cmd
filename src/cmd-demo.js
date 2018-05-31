
/**
 * demo: デモ実行
 * -----------------------------------------------------------------------------
 * ex. g demo
 */

'use strict'

const lib = require('./libs.js')

module.exports = async argv=>{

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

	// エラーテスト
	try {
		throw new Error('エラーテスト（終了コード255）')
	} catch(err) {
		console.log(err)
		process.exit(255);
	}
};
