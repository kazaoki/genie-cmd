'use strict'

const puppeteer = require('puppeteer')
const assert = require('assert')

describe('Google先生の検索結果テスト', function() {

	/**
	 * mocha のタイムアウトを設定
	 * ---------------------------------------------------------------------------------------------
	 */
	this.timeout(5000)
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
				slowMo: 100
			}
		} else {
			conf = {
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox'
				]
			}
		}
		browser = await puppeteer.launch(conf)
		page = await browser.newPage()
		page.on('console', console.log)
	})

	/**
	 * 終了処理
	 * ---------------------------------------------------------------------------------------------
	 */
	after(async () => {
		browser.close()
	})

	/**
	 * カザオキトップ
	 * ---------------------------------------------------------------------------------------------
	 */
	describe('カザオキトップ', async () => {

		before(async function(){
			await page.goto('https://kazaoki.jp', {waitUntil: 'networkidle2'});
		});

		it('ウェブサービス紹介が２つあること', async () => {
			const articles = await page.$$('#service-summary article');
			assert.equal(articles.length, 2);
		});
	});

})
