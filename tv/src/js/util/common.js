/**
 * 通用工具类
 */
import QRCode from 'qrcode'

class Common {

	constructor() {
	}

	isMockMode() {
		return process.env.NODE_ENV === 'mock'
	}

	isDevMode() {
		return process.env.NODE_ENV === 'development'
	}

	isProdMode() {
		return process.env.NODE_ENV === 'production'
	}

	isArray(a) {
		return Object.prototype.toString.call(a) === '[object Array]'
	}

	/**
	 * 获取url参数
	 * @param {String} key 需要获取的name
	 * @returns {String} value 对应的value 或 ""
	 */
	getUrlParam(key) {
		let param = location.search.slice(1)
		param = param && param.split('&').find(item => {
			let k = item.split('=')[0]
			return Object.is(key, decodeURIComponent(k))
		})
		return param && decodeURIComponent(param.split('=')[1])
	}

	/**
	 * 显示二维码
	 * @param 
	 * 	id: element'id 可以是img/div元素
	 * 	url: target url
	 *  {boolean} urlOnly true:只返回二维码url，不显示到具体DOM上;
	 */
	async showQrCode({id, url, urlOnly = false}) {
		let src =await QRCode.toDataURL(url)
		if(urlOnly) return src; //直接返回url
		let el = $(`#${id}`)
		switch(el.prop('tagName')) {
			case 'IMG':
				el.attr('src', src)
				break;
			case 'DIV':
			default:
				el.css({
					'background-image': `url(${src})`,
					'background-repeat': 'no-repeat',
					'background-size': '100%'
				})
				break;
		}
	}

	/**
	 * http get 请求
	 * @param {Object} 
	 * 	url: String
	 * 	data: Object 
	 */
	get({url, data}) {
		console.log('get ' + JSON.stringify(data))
		return new Promise((resolve, reject) => {
			let a = $.ajax({
						url,
						timeout: 10000,
						data,
						success: res => resolve(res),
						fail: err => resolve(err),
						complete: (xhr, status) => {
							if(status == 'timeout') {
								console.error('$.ajax get timeout: ' + url + JSON.stringify(data))
								a.abort()
								resolve('timeout')
							}
						}
					})
		})
	}

	/**
	 * http post 请求
	 * @param {Object} 
	 * 	url: String
	 * 	data: Object 
	 */
	post({url, data}) {
		console.log('post ' + JSON.stringify(data))
		return new Promise((resolve, reject) => {
			let a = $.ajax({
					type: 'POST',
					timeout: 10000,
					url,
					data,
					success: res => resolve(res),
					fail: err => resolve(err),
					complete: (xhr, status) => {
						if(status == 'timeout') {
							console.error('$.ajax post timeout: ' + url + JSON.stringify(data))
							a.abort()
							resolve('timeout')
						}
					}
			})
		})
	}

	/**
	 * 获取当前时间(秒)
	 * @returns {String} 比如 "1587114827"
	 */
	getNowTimeSecond() {
		return +Date.now().toFixed(0).slice(0,10)
	}

	/**
	 * 倒计时
	 * @param {Number} time: 结束时间，格式为 Date.now() 返回值
	 * @returns {String} 比如: 01:20:35
	 */
	getcountdown(time) {
		let now = Date.now(),
			hour=0, 
			minute=0, 
			second=0, 
			total,
			delta = time - now;
		if(delta > 0) {
			delta /= 1000
			hour = Math.floor(delta / 3600)
			minute = Math.floor((delta - hour * 3600) / 60)
			second = Math.floor(delta - hour * 3600 - minute * 60)
		}
		total = [hour, minute, second].map(item => {
			return (item).toString().padStart(2, '0')
		}).join(':')
		return total 
	}

	/**
	 * 延迟一段时间
	 * @param {*} time 
	 */
	sleep(time) {
		return new Promise((resolve) => {
			setTimeout(resolve, time)
		})
	}
	
	/**
	 * 监听未被处理的Promise reject
	 * todo 但是好像没什么用，待研究
	 */
	listenUnhandleRejection() {
		let unhandled = new Map()
		$(window).on('unhandlerejection', (event) => {
			unhandled.set(event.promise, event.reason)
		})
		$(window).on('rejectionhandled', (event) => {
			unhandled.delete(event.promise)
		})
		setInterval(() => {
			console.warn('listenUnhandleRejection trigger..')
			unhandled.forEach((reason, promise) => {
				console.log(reason.message ? reason.message : reason)
				promise.catch(e => console.err(e + ' handled manually!'))
			})
		}, 60000)

	}

	/**
	 * 节流函数
	 * 	第一次调用会立即执行;
	 * 	如果距离上次执行时间没有超到wait时间，直接返回; 
	 * 	如果上次执行完毕，直接执行
	 * @param {Function} fn 
	 * @param {Number} wait 默认2s
	 */
	throttle(fn, wait){
		let flag = false
		return function() {
			console.log('flag: ' + flag)
			if(flag) return 
			let args = Array.prototype.slice.call(arguments)
			fn.apply(this, args)
			flag = true
			setTimeout(() => {				
				flag = false
				console.log('timeout flag false')
			}, wait || 2000)
		}
	}

	/**
	 * 节流函数，
	 * 第一次调用不会立即执行，而是延迟wait时间后执行
	 * 一段时间内只执行一次，比如谷歌搜索联想功能，表单重复提交等
	 * @param {function} fn 
	 * @param {number} wait 
	 */
	throttleDefer(fn, wait){
		let timer = null
		return function() {
			if(timer) return 
			let args = Array.prototype.slice.call(arguments),
				that = this
			timer = setTimeout(() => {
				fn.apply(that, args)
				timer = null
			}, wait)
		}
	}

	/**
	 * 防抖函数，可设置立即执行
	 * 短时间连续操作，只触发最后一次，比如email/验证码校验，窗口resize事件
	 * @param {function} fn 
	 * @param {number} delay 
	 * @param {boolean} immediate 
	 */
	debounce(fn, delay, immediate) {
		let timer = null
		return function() {
			let ctx = this,
			args = Array.prototype.slice.call(arguments)
			timer && clearTimeout(timer)
			if(immediate) {
				let callNow = !timer 
				timer = setTimeout(() => timer = null, delay)
				callNow && fn.apply(ctx, args)
			} else {
				timer = setTimeout(() => {
					fn.apply(ctx, args)
					// timer = null //没必要
				}, delay)
			}
		}
	}
}

const common = new Common()
export default common