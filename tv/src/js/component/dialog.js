import ccmap from '@ccos/ccmap'
import '../../css/dialog.scss'
import ccEvent from '../eventhandler/index.js';

/**
 * 对话框类（模态弹窗） 
 */
class Dialog {
	// /**
	//  * 获取对话框实例，默认为单例模式
	//  */
	// static getInstance(selector) {
	// 	if(!this.inst) {
	// 		this.inst = new Dialog(selector)
	// 	}
	// 	return this.inst
	// }

	constructor(selector) {
		this.id = selector //选择器
		this._param = null //实例化参数
	}

	/**
	 * 显示对话框
	 * @param {Object} param 对话框需要显示的信息，包括title/tips/button上的提示语
	 * @returns res.confirm === true 用户按确认键, 否则用户按取消或返回键
	 */
	show(param) {
		let that = this
		return new Promise(resolve => {
			that._show({
				...param,
				success() {
					resolve({confirm: true})
				},
				fail() {
					resolve({cancel: true})
				}
			})
		})
	}

	/**
	 * 隐藏对话框
	 * @param {Boolean} flag
	 * 		true: 弹窗响应‘取消’键或‘返回’键，需要执行注册的回调函数; 然后再隐藏弹窗
	 * 		false: 仅隐藏弹窗
	 */
	hide(flag=true) {
		if(flag) {
			this._param.onCancel && this._param.onCancel()
			this._param.onComplete && this._param.onComplete()
			this._param.fail()
		}
		//默认不显示取消按钮
		$(this.id).find('.dialog-cancel').hide().removeClass('coocaa_btn')
		$('#dialog').hide()
	}
	
	/**
	 * 查找当前显示的弹窗实例
	 * @returns {Dialog} 当前显示的弹窗实例
	 */
	isShow() { //todo 这里要重点说明或后续优化当前这种模式
		let dlg = null
		if($('#dialog').css('display') === 'none') return dlg;
		//每个弹窗实例对应的className
		let dialoglist = {
			'common': ccDialog,
			'qrcode': ccQrCode,
			'entity-collected': ccEntityCollected,
			'kami': ccKami,
		}
		$('#dialog').children().each(function(){
			if($(this).css('display') != 'none') {
				for(let key in dialoglist) {
					if($(this).hasClass(key)) {
						dlg = dialoglist[key]
						return false
					}
				}
			}
		})
		return dlg
	}

	/**
	 * 事件处理函数
	 * this 是触发事件的DOM元素
	 * e.data.ctx 是注册onClick时传递的调用环境上下文(this)
	 * @param {Event} e 
	 */
	onClick(e) {
		let ctx = e.data.ctx
		if ($(this).hasClass('dialog-confirm')) { //trigger OK button
			ctx._param.onOK && ctx._param.onOK()
			ctx._param.onComplete && ctx._param.onComplete()
			ctx.hide(false)
			ctx._param.success()
		} else { //trigger Cancel or Back button
			ctx.hide()
		}		
	}

	/**
	 * 显示UI，仅限内部使用
	 * @param {Object} param 
	 */
	_show(param) {
		this._param = param
		//显示UI
		this._render()
		$('#dialog').show()
		//初始化焦点，并注册onClick
		let btns = $(`${this.id} .coocaa_btn`),
			defFocus = param.defFocus == 'cancel' ? '.dialog-cancel' : '.dialog-confirm';
		ccmap.init(btns, btns.filter(defFocus), "btn-focus")
		ccEvent.bindClick(btns, {ctx: this}, this.onClick)
	}
	/**
	 * 渲染UI，仅限内部使用
	 */
	_render() {
		let param = this._param
		let dlg = $(this.id).children()
		dlg.find('.title').html(param.title || '提示')
		dlg.find('.icon').attr('src', param.icon)
		dlg.find('.tip').html(param.tip || '')
		dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
		//判断是否需要显示‘取消’按钮
		param.btnCancel && dlg.filter('.dialog-cancel').text(param.btnCancel || '取消').show().addClass('coocaa_btn')
	}
	
}

export {Dialog}
const dialog = new Dialog('#dialog .common')
export default dialog