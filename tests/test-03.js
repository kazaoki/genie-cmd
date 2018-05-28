'use strict'

const puppeteer = require('puppeteer')
const assert = require('assert')
require('../test-helper.js')

process.env.NODE_PUPP = 'browser';

describe('ローカルフォーム', function() {

	/**
	 * mocha のタイムアウトを設定
	 * ---------------------------------------------------------------------------------------------
	 */
	this.timeout(60000)
	let browser, page

	/**
	 * 初期設定
	 * ---------------------------------------------------------------------------------------------
	 */
	before(async () => {
		let conf = {}
		if(process.env.NODE_PUPP=='browser') {
			conf = {
				headless: false,
				slowMo: 100,
				ignoreHTTPSErrors: true
			}
		} else {
			conf = {
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox'
				],
				ignoreHTTPSErrors: true
			}
		}
		browser = await puppeteer.launch(conf)
		page = await browser.newPage()
		page.setViewport({
			width: 1024,
			height: 800
		});
		page.on('console', console.log)
		page.on('dialog', async dialog => {
			console.log('------------------------------------------------');
			console.log('                   DIALOG');
			console.log('------------------------------------------------');
			console.log(dialog.message());
			console.log('------------------------------------------------');
			await dialog.accept();
		});
	})

	/**
	 * 終了処理
	 * ---------------------------------------------------------------------------------------------
	 */
	after(async () => {
		browser.close()
	})

	/**
	 * 1
	 * ---------------------------------------------------------------------------------------------
	 */
	describe('1', async () => {

		before(async function(){
			await page.goto('https://localhost/application/', {waitUntil: 'networkidle2'})
		})

		it('INPUT', async () => {

			await page.screenshot({path: __CAPFILENAME__})
			await page.type('#name', 'サンプル企業１')
			await page.type('#kana', 'サンプルキギョウイチ')
			await page.type('#tel01', '111')
			await page.type('#tel02', '222')
			await page.type('#tel03', '333')
			await page.type('#fax01', '444')
			await page.type('#fax02', '555')
			await page.type('#fax03', '666')
			await page.screenshot({path: __CAPFILENAME__})
			await page.click('#button')
			await page.screenshot({path: __CAPFILENAME__})
			assert(true)
		})
	})

})
