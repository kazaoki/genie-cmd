
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

module.exports = option=>{

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
		lib.Message(option.help(), 'primary', 1)
		process.exit()
	}

	// docker-machine が使える環境の場合はそれも一覧する
	if(lib.hasDockerMachineEnv()) {
		console.log('\n  DockeMachines')
		let result = child.spawnSync('docker-machine', ['ls'])
		if(result.status) lib.Error(result.stderr.toString())
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// イメージ一覧
	{
		console.log('\n  Images')
		let result = child.spawnSync('docker', ['images'])
		if(result.status) lib.Error(result.stderr.toString())
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// データボリューム一覧
	{
		console.log('\n  Volumes')
		let result = child.spawnSync('docker', ['volume', 'ls', '--format', 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}'])
		if(result.status) lib.Error(result.stderr.toString())
		lib.Message(result.stdout.toString(), 'primary', 1)
	}

	// コンテナ一覧
	{
		console.log('\n  Containers')
		let format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}']
		let header = ['NAMES', 'ID', 'IMAGE', 'STATUS', 'PORTS']
		if(argv.long) {
			format = ['--format', '{{.Names}}\t{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Labels}}']
			header = ['NAMES', 'ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'LABELS']
		}
		let result = child.spawnSync('docker', ['ps', '-a', ...format])
		if(result.status) lib.Error(result.stderr.toString())
		let lines = result.stdout.toString().trim().split('\n')
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

		lib.Message(cliui.toString(), 'primary', 1)

	}

	process.exit();
};
