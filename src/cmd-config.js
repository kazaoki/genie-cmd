
/**
 * config: 設定ファイルを見る・開く
 * -----------------------------------------------------------------------------
 * ex. g config
 *     g config -d
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')

module.exports = async option=>{
	// オプション設定
	let argv = option
		.usage('Usage: genie|g config [Options]')
		.options('dump', {
			alias: 'd',
			describe: '設定値を確認します。'
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

	if(argv.dump){
		// 設定値を表示する
		d(config)
	} else {
		// エディタで開く
		let config_js = `${lib.getRootDir()}/.genie/${argv.config}`;
		if(lib.isWindows()) {
			child.execSync(`start ${config_js}`)
		} else if(lib.isMac()) {
			child.execSync(`open ${config_js}`)
		}
	}
};
