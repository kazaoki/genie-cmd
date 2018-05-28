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
	 * Google検索テスト：Apple
	 * ---------------------------------------------------------------------------------------------
	 */
	describe('検索テスト：Apple', async () => {

		before(async function(){
			await page.goto('https://www.google.co.jp/', {waitUntil: 'networkidle2'})
		})

		it('「Apple」検索結果が１位に出てること', async () => {
			await page.type('#lst-ib', 'Apple')
			await page.keyboard.press('Enter')
			await page.waitForNavigation('networkidle2')
			let href = await page.$eval('#rso > div:nth-child(1) > div > div > div > div > h3 > a:nth-child(1)', e=>e.href)
			assert(href.match(/https\:\/\/www\.apple\.com/))
		})
	})

})
