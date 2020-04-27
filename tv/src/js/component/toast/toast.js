/**
 * Toast对象
 */
import './toast.scss'

class Toast {
	constructor(selector) {
		this.name = 'toast'
		this.id = selector
		this.timer = null
	}

	/**
	 * 显示toast，默认2s后自动消失
	 * @param {String} content 需要显示的HTML内容
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
	}

	/**
	 * 隐藏toast，清空提示语
	 */
	hide() {
		this.timer && clearTimeout(this.timer)
		$(`${this.id}`).hide().find('.text').empty()
	}

	/**
	 * 渲染弹窗内容（HTML格式）
	 * @param {String} content 需要显示的HTML内容
	 */
	_show(content) {
		$(`${this.id}`).show().find('.text').html(content)
	}
}

const toast = new Toast('#toast')
export default toast
