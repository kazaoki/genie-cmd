
'use strict'

const stringWidth = require('string-width')
const cliColor = require('cli-color')
const readline = require('readline').createInterface(process.stdin, process.stdout);
const fs = require('fs');
const childProcess = require('child_process');

/**
 * Repeat
 * @param {string} string 繰り返したい文字
 * @param {number} times 繰り返したい回数
 * @return {string} 繰り返した文字列
 * -----------------------------------------------------------------------------
 */
	//  module.exports.Repeat = (string, times=1)=>{
const Repeat = module.exports.Repeat = (string, times=1)=>{
	if(!times>0) return '';
	var lump = '';
	for(var i=0; i<times; i++) {
		lump += string;
	}
	return lump;
}

/**
 * Message
 * @param {string} message 表示したいメッセージ。改行込み複数行対応。
 * @param {string} type タイプ。primary|success|danger|warning|info|default
 * @param {number} line タイトル線を引く位置。
 */
const Message = module.exports.Message = (message, type='default', line=0)=>{
	var indent = '  ';
	var line_color = cliColor.white;
	var fg_color = cliColor.white;
	if(type==='primary') {
		line_color = cliColor.xterm(26)
		fg_color = cliColor.xterm(39)
	} else if(type==='success') {
		line_color = cliColor.green
		fg_color = cliColor.greenBright
	} else if(type==='danger') {
		line_color = cliColor.red
		fg_color = cliColor.redBright
	} else if(type==='warning') {
		line_color = cliColor.yellow
		fg_color = cliColor.yellowBright
	} else if(type==='info') {
		line_color = cliColor.whiteBright
		fg_color = cliColor.whiteBright
	}

	var messages = message.split(/[\r\n]+/)
	var length = 0;
	for(var i in messages) {
		var len = stringWidth(messages[i])
		if(length < len) length = len;
	}
	length += 2;

	console.log(
		indent +
		line_color('┏') +
		line_color(Repeat('─', length)) +
		line_color('┓')
	)
	for(var i in messages) {
		if(line>0 && line==i) {
			console.log(
				indent +
				line_color('┣') +
				line_color(Repeat('─', length)) +
				line_color('┫')
			)
		}
		console.log(
			indent +
			line_color('│') +
			fg_color(' '+messages[i]+' ') +
			Repeat(' ', (length-2) - stringWidth(messages[i])) +
			line_color('│')
		)
	}
	console.log(
		indent +
		line_color('┗') +
		line_color(Repeat('─', length)) +
		line_color('┛')
	)
}

/**
 * Input
 * @param {string} message 入力を促す表示メッセージ
 * @param {number} tail_space 背景BOXの長さを追加する文字数
 * @return {string} 入力値
 */
const Input = module.exports.Input = (message, tail_space=20)=>{
	var indent = cliColor.bgBlack('  ');
	message = '  ' + message + '  ';
	var len = stringWidth(message) + tail_space;
	var fg = cliColor.whiteBright.bgBlueBright;
	var bg = cliColor.bgBlue;
	console.log(
		'\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + fg(message + Repeat(' ', tail_space))  + '\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + bg(Repeat(' ', len))
	);
	process.stdout.write(cliColor.move.up(3));
	process.stdout.write(cliColor.move.right(len - tail_space));
	return new Promise (
		(result) => {
			readline.on('line', (input)=>{
				process.stdout.write(cliColor.move.down(3));
				result(input)
			})
		}
	);
}

/**
 * isWindows
 * @return {boolean} Windowsかどうか
 */
const isWindows = module.exports.isWindows = ()=>{return process.platform === 'win32'}

/**
 * isMac
 * @return {boolean} MacOSかどうか
 */
const isMac = module.exports.isMac = ()=>{return process.platform === 'darwin'}

/**
 * Say
 * @param {string} message スピーチする文字列
 */
const Say = module.exports.Say = message=>{
	if(message.length===0) return;
	// Macの場合はsayコマンド
	if(isMac()) {
		childProcess.execSync(`say -r 300 "${message}"`)
	}
	// Windowsの場合はwscriptスクリプトをtempに用意してから実行（最後は削除する）
	else if(isWindows()) {
		let temp_dir = fs.mkdtempSync(process.env.TEMP+'/genie-say-')
		let temp_file = temp_dir+'/say.js'
		fs.writeFileSync(temp_file, `var args = [];for(var i = 0; i < WScript.Arguments.length; i++) args.push(WScript.Arguments.Item(i));WScript.CreateObject('SAPI.SpVoice').Speak('<volume level="100">'+'<rate speed="2">'+'<pitch middle="0">'+args.join(' ')+'</pitch>'+'</rate>'+'</volume>', 8);`)
		childProcess.execSync(`start wscript ${temp_file} "${message}"`)
		fs.unlinkSync(temp_file)
		fs.rmdirSync(temp_dir)
	}
}
