
/**
 * clean: 不要なdockerオブジェクトを削除する
 * -----------------------------------------------------------------------------
 * ex. g clean
 *     g clean -f
 */

'use strict'

const lib = require('./libs.js')
const d = lib.d
const h = lib.h
const child = require('child_process')
const color = require('cli-color')

module.exports = option=>{

	// オプション設定
	let argv = option
		.usage('Usage: genie|g clean [Options]')
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

	let cmd;
	let result;
	let count = 0;

	// コンテナ削除（exitedなやつ）
	cmd = ['ps', '-qa', '--filter', 'exited=0', '--format', '{{.Names}}']
	result = child.spawnSync('docker', cmd)
	if(result.status) lib.Error(result.stderr.toString())
	for(let name of result.stdout.toString().trim().split(/\n/)) {
		if(!name) continue;
		if(!argv.f) if(name.match(/^locked_/i)) continue;
		if(!count++) console.log()
		process.stdout.write(`  [Container] ${name} - `);
		let run = child.spawnSync('docker', ['rm', '-fv', name])
		if(run.status) lib.Error(run.stderr.toString())
		process.stdout.write(color.green('deleted\n'));
	}

	// ボリューム削除（リンクされてないやつ）
	cmd = ['volume', 'ls', '--filter', 'dangling=true', '--format', '{{.Name}}']
	result = child.spawnSync('docker', cmd)
	if(result.status) lib.Error(result.stderr.toString())
	for(let name of result.stdout.toString().trim().split(/\n/)) {
		if(!name) continue;
		if(!argv.f) if(name.match(/^locked_/i)) continue;
		if(!count++) console.log()
		process.stdout.write(`  [Volume] ${name} - `);
		let run = child.spawnSync('docker', ['volume', 'rm', '-f', name])
		if(run.status) lib.Error(run.stderr.toString())
		process.stdout.write(color.green('deleted\n'));
	}

	// イメージ削除（<none>のやつ）
	cmd = ['images', '-q', '--filter', 'dangling=true']
	result = child.spawnSync('docker', cmd)
	if(result.status) lib.Error(result.stderr.toString())
	for(let id of result.stdout.toString().trim().split(/\n/)) {
		if(!id) continue;
		if(!count++) console.log()
		process.stdout.write(`  [Image] ${id} - `);
		let run = child.spawnSync('docker', ['rmi', id])
		if(run.status) lib.Error(run.stderr.toString())
		process.stdout.write(color.green('deleted\n'));
	}

	if(!count){
		h('対象のオブジェクトはありませんでした。')
	}

	process.exit()
}
