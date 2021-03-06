
/**
 * build: 設定に基づいてイメージをビルドする
 * -----------------------------------------------------------------------------
 * ex. g build
 *     g build --no-cache
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const color = require('cli-color')

module.exports = async option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g build [Options]')
		.options('no-cache', {
			alias: 'n',
			describe: 'キャッシュを使用せずにビルドする',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	// 設定ファイルロード
	let config = lib.loadConfig(argv);

	// 確認
	let input = await lib.Input(`${config.core.docker.image} イメージをビルドしてもよろしいでしょうか。[y/N]: `)

	// ビルド実行
	if(input.match(/^y$/i)) {
		let args = ['build', '-t', config.core.docker.image]
		if(argv['no-cache']) args.push('--no-cache')
		args.push(`${lib.getRootDir()}/.genie/image/`)
		lib.Message(`ビルドを開始します。\ndocker ${args.join(' ')}`, 'info');
		console.log()
		let stream = child.spawn('docker', args);
		stream.stdout.on('data', (data)=>{
			console.log(color.blackBright(data.toString().trim()))
		})
		stream.stderr.on('data', (data)=>{
			lib.Error(data)
		})
		stream.on('close', (code) => {
			let mes = 'ビルドが完了しました。'
			lib.Message(mes)
			lib.Say(mes)
		});
	}

};
