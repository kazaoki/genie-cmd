
/**
 * clean: 不要なdockerオブジェクトを削除する
 * -----------------------------------------------------------------------------
 * ex. g clean
 *     g clean -f
 */

'use strict'

const lib = require('./libs.js')
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
	let funcs;

	(async()=>{

		// コンテナ削除（exitedなやつ）
		funcs = []
		cmd = ['ps', '-qa', '--filter', 'exited=0', '--format', '{{.Names}}']
		result = child.spawnSync('docker', cmd)
		if(result.status) lib.Error(result.stderr.toString())
		for(let name of result.stdout.toString().trim().split(/\n/)) {
			if(!name) continue;
			if(!argv.f) if(name.match(/^locked_/i)) continue;
			funcs.push(new Promise((resolve, reject)=>{
				if(!count++) console.log()
				child.spawn('docker', ['rm', '-fv', name])
					.stderr.on('data', data=>reject(data))
					.on('close', code=>{
						console.log(`  [Container] ${name} - ${color.green('deleted')}`)
						resolve()
					})
			}))
		}
		await Promise.all(funcs).catch(err=>{lib.Error(err)})

		// ボリューム削除（リンクされてないやつ）
		funcs = []
		cmd = ['volume', 'ls', '--filter', 'dangling=true', '--format', '{{.Name}}']
		result = child.spawnSync('docker', cmd)
		if(result.status) lib.Error(result.stderr.toString())
		for(let name of result.stdout.toString().trim().split(/\n/)) {
			if(!name) continue;
			if(!argv.f) if(name.match(/^locked_/i)) continue;
			funcs.push(new Promise((resolve, reject)=>{
				if(!count++) console.log()
				child.spawn('docker', ['volume', 'rm', '-f', name])
					.stderr.on('data', data=>reject(data))
					.on('close', code=>{
						console.log(`  [Volume] ${name} - ${color.green('deleted')}`)
						resolve()
					})
			}))
		}
		await Promise.all(funcs).catch(err=>{lib.Error(err)})

		// イメージ削除（<none>のやつ）
		cmd = ['images', '-q', '--filter', 'dangling=true']
		result = child.spawnSync('docker', cmd)
		if(result.status) lib.Error(result.stderr.toString())
		for(let id of result.stdout.toString().trim().split(/\n/)) {
			if(!id) continue;
			funcs.push(new Promise((resolve, reject)=>{
				if(!count++) console.log()
				child.spawn('docker', ['rmi', id])
					.stderr.on('data', data=>reject(data))
					.on('close', code=>{
						console.log(`  [Image] ${id} - ${color.green('deleted')}`)
						resolve()
					})
			}))
		}
		await Promise.all(funcs).catch(err=>{lib.Error(err)})

		// 対象なし
		if(!count) h('対象のオブジェクトはありませんでした。')

		process.exit()
	})();

}
