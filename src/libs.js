
'use strict'

const stringWidth = require('string-width')
const clc = require('cli-color')
const rl = require('readline').createInterface(process.stdin, process.stdout);

/**
 * Repeat
 * @param {*} string
 * @param {*} times
 */
module.exports.Repeat = function (string, times=1)
{
	var lump = '';
	if(times>0) {
		for(var i=0; i<times; i++) {
			lump += string;
		}
	}
	return lump;
}
const Repeat = module.exports.Repeat;

/**
 * Message
 * @param {*} message
 * @param {*} type
 * @param {*} line
 */
module.exports.Message = function (message, type='default', line=0)
{
	var indent = '  ';
	var line_color = clc.white;
	var fg_color = clc.white;
	if(type==='primary') {
		line_color = clc.xterm(26)
		fg_color = clc.xterm(39)
	} else if(type==='success') {
		line_color = clc.green
		fg_color = clc.greenBright
	} else if(type==='danger') {
		line_color = clc.red
		fg_color = clc.redBright
	} else if(type==='warning') {
		line_color = clc.yellow
		fg_color = clc.yellowBright
	} else if(type==='info') {
		line_color = clc.whiteBright
		fg_color = clc.whiteBright
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
 * @param {*} message
 * @param {*} tail_space
 */
module.exports.Input = function (message, tail_space=20)
{
	var indent = clc.bgBlack('  ');
	message = '  ' + message + '  ';
	var len = stringWidth(message) + tail_space;
	var fg = clc.whiteBright.bgBlueBright;
	var bg = clc.bgBlue;
	console.log(
		'\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + fg(message + Repeat(' ', tail_space))  + '\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + bg(Repeat(' ', len))
	);
	process.stdout.write(clc.move.up(3));
	process.stdout.write(clc.move.right(len - tail_space));
	return new Promise (
		(result) => {
			rl.on('line', (input)=>{
				process.stdout.write(clc.move.down(3));
				result(input)
			})
		}
	);
}
