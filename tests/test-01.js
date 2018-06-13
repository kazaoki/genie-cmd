
'use strict'

const puptester = require('puptester')
const assert = require('assert')

describe('ローカルフォーム', function() {

	/**
	 * mocha のタイムアウト設定・変数宣言
	 * ---------------------------------------------------------------------------------------------
	 */
	this.timeout(60000)
	let pt, browser, page
	let http_url = `http://${process.env.GENIE_HOST_IP}:${process.env.GENIE_PORT80}`
	let https_url = `https://${process.env.GENIE_HOST_IP}:${process.env.GENIE_PORT443}`

	/**
	 * 初期設定
	 * ---------------------------------------------------------------------------------------------
	 */
	before(async () => {
		pt = await puptester.init(
			'https://kazaoki.jp',
			{
				width: 320,
				height: 150,
				launch_options: {
					// headless: false,
				}
			}
		);
		browser = pt.browser
		page = pt.page
	})

	/**
	 * 終了処理
	 * ---------------------------------------------------------------------------------------------
	 */
	after(async () => {
		await browser.close()
	})

	/**
	 * 1
	 * ---------------------------------------------------------------------------------------------
	 */
	describe('てすとやんけ', async () => {

	// 	before(async ()=>{
	// 		await page.goto('https://kazaoki.jp/inquiry/', {waitUntil: 'networkidle2'})
	// 	})

	// 	it('INPUT', async ()=>{
	// 		await page.screenshot({path: `tests-report/captures/${__capfilename}`})
	// 		await page.type('input[name=company_name]', 'サンプル企業１')
	// 		await page.type('input[name=company_kana]', 'サンプルキギョウイチ')
	// 		await page.screenshot({path: `tests-report/captures/${__capfilename}`})
	// 		await page.click('input[type=submit]')
	// 		await page.screenshot({path: `tests-report/captures/${__capfilename}`})
	// 		assert(true)
	// 	})

		before(async ()=>{
			await page.goto(http_url, {waitUntil: 'networkidle2'})
		})

		it('VAR='+http_url)
		it('INPUT', async ()=>{
			await page.screenshot({path: `tests-report/captures/t_${__capfilename}`})
			// await page.type('input[name=company_name]', 'サンプル企業１')
			// await page.type('input[name=company_kana]', 'サンプルキギョウイチ')
			// await page.screenshot({path: `tests-report/captures/${__capfilename}`})
			// await page.click('input[type=submit]')
			// await page.screenshot({path: `tests-report/captures/${__capfilename}`})
			// assert(false)
			assert(true)
		})
		it('TODO 1')
		it('TODO 2')
		it('TODO 3')
		it('TODO 4')
		it('TODO 5')
	})

})
