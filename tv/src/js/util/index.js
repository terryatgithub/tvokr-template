import QRCode from 'qrcode'

var util = {
	isMockMode() {
		return process.env.NODE_ENV === 'mock'
	},
	isDevMode() {
		return process.env.NODE_ENV === 'development'
	},
	isProdMode() {
		return process.env.NODE_ENV === 'production'
	},
	isShow() {
		console.log(`util.isShow id: ${this.id}`)
		return $(this.id).css('display') !== 'none'
	},
	//封装网络接口
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
	},
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
	},
	isArray(a) {
		return Object.prototype.toString.call(a) === '[object Array]'
	},
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

	},
	getUrlParam(key) {
		let param = location.search.slice(1)
		param = param && param.split('&').find(item => {
			let k = item.split('=')[0]
			return Object.is(key, decodeURIComponent(k))
		})
		return param && decodeURIComponent(param.split('=')[1])
	},
	/**
	 * 显示二维码
	 * @param 
	 * 	el: element'id 
	 * 	url: target url
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
	},
	/**
	 * 获取当前时间(秒)
	 */
	getNowTimeSecond() {
		return +(+new Date()).toFixed(0).slice(0,10)
	},
	/**
	 * 倒计时
	 * time: 结束时间，格式为new Date().getTime()返回值
	 * return: 01:20:35
	 */
	getcountdown(time) {
		let now = new Date().getTime(),
			hour=0, minute=0, second=0, total,
			delta = time - now
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
	},
	/**
	 * 立即执行，
	 * 下次执行时先判断：
	 * 如果距离上次执行时间没有超到wait时间，直接返回; 
	 * 如果上次执行完毕，直接执行
	 * @param {*} fn 
	 * @param {*} wait 
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
			}, wait)
		}
	},
	/**
	 * 节流函数，
	 * 一段时间内只执行一次，比如谷歌搜索联想功能，表单重复提交等
	 * @param {function} fn 
	 * @param {number} wait 
	 */
	throttleByTimeout(fn, wait){
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
	},
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
	},
	/**
	 * 延迟一段时间
	 * @param {*} time 
	 */
	sleep(time) {
		return new Promise((resolve) => {
			setTimeout(resolve, time)
		})
	}
}

export default util