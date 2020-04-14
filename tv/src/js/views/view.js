class Component {
	constructor(param) {
		this.param = param
		this.id = this.param.id
	}
	async init(str) {
		let param = this.param 
		console.log(`init, page name:${param.name}`)
		param.created && await param.created(str)
	}
	uninit() {
		let param = this.param 
		console.log(`deinit, page name:${param.name}`)
		param.destroyed && param.destroyed()
	}
	isShow() {
		return ccUtil.isShow.apply(this)
	}
	rebindKeys() {
		let param = this.param
		param.bindKeys && param.bindKeys()
	}
	refreshPage() {
		let param = this.param
		param.refreshPage && param.refreshPage()
	}
}

export default Component