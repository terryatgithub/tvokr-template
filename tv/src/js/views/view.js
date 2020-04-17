/**
 * 页面基类，不能被实例化
 */

class View {
	constructor(selector) {
		if(new.target === View) {
			throw new Error('View is an abstract class, can NOT be instanced.')
		}
		this.id = selector
	}
		
	async init(str) {
		console.log(`init, page name:${this.name}`)
		this.created && await this.created(str)
	}
	
	uninit() {
		console.log(`deinit, page name:${this.name}`)
		this.destroyed && this.destroyed()
	}

	isShow() {
		return ccUtil.isShow.apply(this)
	}

	rebindKeys() {
		this.bindKeys && this.bindKeys()
	}
	
	refreshPage() {
		this.refreshPage && this.refreshPage()
	}
	/**
	 * 生命周期函数 created
	 * @param {*} param 
	 */
	created(param) {

	}

	destroyed() {

	}


}

export default View