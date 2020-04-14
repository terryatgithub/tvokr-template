/**
 * PC debug 为PC上debug使用
 */
var pcDebug = {
	bindEvent(ctx) { //测试返回键（在PC上，用click模拟TV上的返回键）
		$('.coocaa_btn').on('click', function () {
			console.log('click ...........')
			ctx.backKeyHandler()	 
		}) 
	},
	init(ctx) {
		if(ccDebug.isPCMode()) {
			this.bindEvent(ctx)
		}
	}
}

export default pcDebug