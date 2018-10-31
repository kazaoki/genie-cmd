
/**
 * ls: Dockerオブジェクト一覧
 * -----------------------------------------------------------------------------
 * ex. g ls
 *     g ls -l
 */

'use strict'

const lib = require('./libs.js')
const child = require('child_process')
const color = require('cli-color')
const cliui = require('cliui')({width: color.windowSize.width-4})

module.exports = async option=>{

	// ランモード表示
	lib.showRunmode()

	// オプション設定
	let argv = option
		.usage('Usage: genie|g ls [Options]')
		.options('long', {
			alias: 'l',
			describe: 'コンテナ一覧がもうちょっとだけ詳細に出ます'
		})
		.argv;
	;
	if(argv.help) {
		console.log()
		return lib.Message(option.help(), 'primary', 1)
	}

	return new Promise((resolve, reject)=>{

		// 各種情報取得を並行して取得させる
		let funcs = []
		let outputs = {}

		// docker-machine が使える環境の場合はそれも一覧する
		funcs.push(new Promise((ok,ng)=>{
			child.execFile('docker-machine', ['ls'], (error, stdout, stderr)=>{
				outputs['DockeMachines'] = stdout
				ok()
			})
		}))

		// イメージ一覧
		funcs.push(new Promise((ok,ng)=>{
			child.execFile('docker', ['images'], (error, stdout, stderr)=>{
				error && ng()
				outputs['Images'] = stdout
				ok()
			})

		}))

		// データボリューム一覧
		funcs.push(new Promise((ok,ng)=>{
			child.execFile('docker', ['volume', 'ls', '--format', 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}'], (error, stdout, stderr)=>{
				error && ng()
				outputs['Volumes'] = stdout
				ok()
			})
		}))

		// コンテナ一覧
		funcs.push(new Promise((ok,ng)=>{
			let format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}']
			let header = ['NAMES', 'ID', 'IMAGE', 'STATUS', 'PORTS']
			if(argv.long) {
				format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Labels}}']
				header = ['NAMES', 'ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'LABELS']
			}
			child.execFile('docker', ['ps', '-a', ...format],  (error, stdout, stderr)=>{
				error && ng()

				let lines = stdout.trim().split('\n')
				lines.unshift(header.join('\t'))
				for(let i in lines) {
					let column = lines[i].split(/\t/)
					let set = []
					for(let j in column) {
						let width;
						if(!argv.long) {
							// if(j==0) width = 40 // NAMES
							// if(j==1) width = 15 // ID
							// // if(j==2) width = 30 // IMAGE
							if(j==4) width = 30 // PORTS
						} else {
							// if(j==0) width = 40 // NAMES
							// if(j==1) width = 15 // ID
							// // if(j==2) width = 30 // IMAGE
							if(j==6) width = 30 // PORTS
							if(j==7) width = 50 // LABELS
						}
						set.push({
							text: column[j].replace(/, ?/g, '\n'),
							width: width,
							padding: [0, 1, 0, 1],
						})
					}
					cliui.div(...set)
				}
				outputs['Containers'] = cliui.toString()
				ok()
			})
		}))

		// 出力
		Promise.all(funcs)
			.then(()=>{
				// DockerMachines
				if(outputs['DockerMachines']) {
					console.log('\n  DockeMachines')
					lib.Message(outputs['DockeMachines'], 'primary', 1)
				}

				// Images
				console.log('\n  Images')
				lib.Message(outputs['Images'], 'primary', 1)

				// Volumes
				console.log('\n  Volumes')
				lib.Message(outputs['Volumes'], 'primary', 1)

				// Containers
				console.log('\n  Containers')
				lib.Message(outputs['Containers'], 'primary', 1)

				resolve()

			})
			.catch(e=>lib.Error(e))
	})
};
