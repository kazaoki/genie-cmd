
/**
 * version: genie-cmdのバージョンを表示する
 * -----------------------------------------------------------------------------
 * ex. g version
 */

'use strict'

const lib = require('./libs.js')

module.exports = async option=>{
	var json = require('../package.json');
	process.stdout.write('\n')
	lib.Message(`${json.name} ver ${json.version}`, 'primary');
	process.stdout.write('\n')
};
