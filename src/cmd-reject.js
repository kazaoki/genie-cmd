
/**
 * reject: 全てのdockerコンテナ・ボリュームを削除する
 * -----------------------------------------------------------------------------
 * ex. g reject
 *     g reject -f
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const inquirer = require('inquirer')
const color = require('cli-color')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g reject [Options]')
		.options('force', {
			alias: 'f',
			describe: 'lockedから始まる名前も対象にする',
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// コンテナ一覧取得
	let list_containers = []
	let result = child.spawnSync('docker', ['ps', '-qa', '--format', '{{.Names}}\t{{.Status}}'])
	if(result.status) lib.Error(result.stderr.toString())
	for(let line of result.stdout.toString().trim().split(/\n/)) {
		if(!line) continue
		let column = line.split(/\t/)
		let name = column[0]
		let status = column[1]
		let is_locked = name.match(/^locked_/)
		let label = `[Container] ${name}`
		if(is_locked) label = color.blackBright(label)
		list_containers.push({
			name: label,
			checked: (is_locked&&(!argv.f) ? false : true)
		})
	}

	// ボリューム一覧取得
	let list_volumes = []
	result = child.spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}\t{{.Driver}}'])
	if(result.status) lib.Error(result.stderr.toString())
	for(let line of result.stdout.toString().trim().split(/\n/)) {
		if(!line) continue
		let column = line.split(/\t/)
		let name = column[0]
		let driver = column[1]
		let is_locked = name.match(/^locked_/)
		let label = `[Volume] ${name}`
		if(is_locked) label = color.blackBright(label)
		list_volumes.push({
			name: label,
			checked: (is_locked&&(!argv.f) ? false : true)
		})
	}

	// 対象数カウント
	let list_count = list_containers.length + list_volumes.length
	if(list_count===0) {
		h('対象のオブジェクトはありませんでした。')
		process.exit()
	}

	console.log()
	inquirer.prompt([
		{
			type: 'checkbox',
			message: '削除したいものにチェックを入れて Enter してください。',
			name: 'rejects',
			pageSize: 100,
			choices: [
				...list_containers,
				...list_volumes,
			],
		}
	]).then(answers=>{

		// 画面クリア
		process.stdout.write(color.move.up(list_count));
		for(let i=0; i<list_count; i++){
			process.stdout.write(color.erase.line);
			process.stdout.write(color.move.down(1));
		}
		process.stdout.write(color.move.up(list_count-1));

		// 削除処理開始
		for(let label of answers.rejects) {
			label = color.strip(label);
			let matches = label.match(/^\[(Container|Volume)\] (.+)$/)
			// d(matches)

			// コンテナの削除
			if(matches[1]==='Container') {
				let name = matches[2];
				process.stdout.write(`  [Container] ${name} - `);
				let run = child.spawnSync('docker', ['rm', '-f', name])
				if(run.status) lib.Error(run.stderr.toString())
				process.stdout.write(color.green('deleted\n'));
			}
			// ボリュームの削除
			else if(matches[1]==='Volume') {
				let name = matches[2];
				process.stdout.write(`  [Volume] ${name} - `);
				let run = child.spawnSync('docker', ['volume', 'rm', '-f', name])
				if(run.status) lib.Error(run.stderr.toString())
				process.stdout.write(color.green('deleted\n'));
			}
		}
	});
}
