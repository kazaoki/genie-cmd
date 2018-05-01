
'use strict'

/**
 * Message
 */
function Message(message, type='default', line=0)
{
	// console.log(message)
	// console.log(type)
	// console.log(line)

	// var cls = clc.xterm(10).bgXterm(14);

	// console.log(clc.white.bgBlue.bold('                            '));

	// console.log(cls('ABC'));
	// process.stdout.write(clc.reset);
	// process.stdout.write(clc.erase.screen);
	// process.stdout.write(clc.erase.screenRight);
	// process.stdout.write(clc.move(-2, -2)); // Move cursors two columns and two rows back

	// process.stdout.write(clc.move.lines(2));
	// console.log(cls('123'));

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
function Repeat(string, times=1)
{
	var lump = '';
	if(times>0) {
		for(var i=0; i<times; i++) {
			lump += string;
		}
	}
	return lump;
}

/**
 * Input
 */
function Input(message, tail_space=20)
{
	var indent = '  ';
	message = '  ' + message + '  ';
	var len = stringWidth(message) + tail_space;
	var fg = clc.whiteBright.bgBlueBright;
	var bg = clc.bgBlue;
	console.log(
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + fg(message + Repeat(' ', tail_space))  + '\n' +
		indent + fg(Repeat(' ', len)) + '\n' +
		indent + bg(Repeat(' ', len))
	);

	// var input = fs.readFileSync('/dev/stdin', 'utf8');
	// var input = '';
	// process.stdin.resume();
	// process.stdin.setEncoding('utf8');
	// process.stdin.on('data', function(chunk) {
	// 	input += chunk;
	// });
	// process.stdin.on('end', function() {
	// 	return input;
	// });

	// var f = async () => {
	// 	var ret = await () => {
	// 		const rl=require("readline").createInterface(process.stdin,process.stdout);
	// 		rl.on("line",function(str){
	// 			console.log("get:"+str);
	// 		});
	// 	}
	// };
	// f();

	// rl.moveCursor(process.stdin, 0,0)

	// (async function(){
	// 	// var str = await new Promise(res=>rl.once("line",res));
	// 	// console.log("getA:"+str);
	// 	// str = await new Promise(res=>rl.once("line",res));
	// 	// console.log("getB:"+str);
	// 	// str = await new Promise(res=>rl.once("line",res));
	// 	// console.log("getC:"+str);
	// 	// console.log("end");

	// 	//関数化
	// 	const gets=()=>new Promise(res=>rl.once("line",res))
	// 	var str = await gets();
	// 	console.log("getA:" + str);
	// 	str = await gets();
	// 	console.log("getB:" + str);
	// 	str = await gets();
	// 	console.log("getC:" + str);
	// 	console.log("end");

	// 	process.exit();
	// })();

	(async ()=>{
		console.log('!!');
	})();


}
