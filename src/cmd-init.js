
/**
 * init：初期化
 * -----------------------------------------------------------------------------
 * ex. g init
 */

'use strict'

const lib = require('./libs.js')
const path = require('path')
const fs = require('fs-extra')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g init')
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// パス決定
	let from = path.join(__dirname, '../.genie')
	let to = path.join(process.cwd(), '.genie')

	// コピー元の存在確認
	try {
		fs.accessSync(from)
	} catch(e) {
		lib.Error(`初期化元になる .genie/ ディレクトリが見つかりません。 genic-cmd 自体を再インストールしてください。\n${from}`)
	}

	// コピー先の存在確認
	try {
		fs.accessSync(to)
		lib.Error(`このディレクトリには既に .genie/ が存在しています。\n${to}`)
	} catch(e) {}

	// .gnieコピー
	fs.copySync(from, to)
};
