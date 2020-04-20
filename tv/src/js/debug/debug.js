/**
 * 为在PC上调试使用
 */
class PCDebug {
	constructor() {
	}

	/**
	 * 在PC上调试的初始化函数
	 * @param {Object} ctx 调用函数的对象this 
	 */
	init(ctx) {
		if(ccDebug.isPCMode()) {
			this.bindEvent(ctx)
		}
	}

	/**
	 * 在PC上，用click模拟TV上的返回键, 以测试返回键相关逻辑
	 * @param {Object} ctx 调用函数的对象this 
	 */
	bindEvent(ctx) { 
		$('.coocaa_btn').on('click', function () {
			console.log('click ...........')
			ctx.backKeyHandler()	 
		}) 
	}
}

const pcDebug = new PCDebug()
export default pcDebug