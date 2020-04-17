/**
 * 页面纯基类，不能被实例化,只能被继承
 */

class View {
	
	constructor(selector) {
		console.log('new View.')
		if(new.target === View) {
			throw new Error('View is an abstract class, can NOT be instanced.')
		}
		this.id = selector //当前页面对应的选择器ID
		this.coocaaBtns = `${selector} .coocaa_btn` //当前页面可落焦按钮
        this.curFocus = 0 //当前页面焦点
	}
		
	/**
	 * 页面初始化
	 * @param {String} hash 路由hash，可能带参数
	 * 比如 'home?focus=seckill'
	 */
	async init(hash) {
		console.log(`View init, page name:${this.name}`)
		this.created && await this.created(hash)
	}
	
	/**
	 * 页面反初始化
	 */
	uninit() {
		console.log(`View uninit, page name:${this.name}`)
		this.destroyed && this.destroyed()
	}

	/**
	 * 查看当前页面是否处于显示状态
	 */
	isShow() {
		return ccUtil.isShow.apply(this)
	}
}

export default View