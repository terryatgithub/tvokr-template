import '../../css/toast.scss'

var toast = {
	name: 'toast',
	id: '#toast',
	timer: null,
	_show(content) {
		$(`${this.id}`).show().find('.text').html(content)
	},
	/**
	 * 显示toast
	 * @param {*} 
	 */
	show(content, time = 2000) {
		return new Promise((resolve) => {
			let param = content || '加载中，请稍候~'
			this._show(param)
			this.timer = setTimeout(() => {
							this.hide()
							resolve()
						}, time)
		})
	},
	hide() {
		this.timer && clearTimeout(this.timer)
		$(`${this.id}`).hide().find('.text').empty()
	}
}

export default toast