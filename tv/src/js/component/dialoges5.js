import '../../css/dialog.scss'
import ccEvent from '../handler/index.js';

/**
 * 确认弹窗
 * sample 用法如下
 */
// ccDialog.show({
// 	title: '恭喜您成功瓜分10天VIP权益',
// 	icon: './images/dialog/iconframe.png',
// 	tip: '奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
// 	btnOK: '立即领取',
// 	btnCancel: '取消',
// 	onOK: function() { 
// 		console.log('ok') 
// 	},
// 	onCancel: function() {
// 		console.log('cancel')
// 	},
// 	onComplete: function() {
// 		console.log('complete')
// 	}
// })
var dialog = {
	id: '#dialog .common',
	_param: null,
	_render() {
		let param = this._param
		let dlg = $(this.id).children()
		dlg.find('.title').html(param.title || '提示')
		dlg.find('.icon').attr('src', param.icon)
		dlg.find('.tip').html(param.tip || '')
		dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
		param.btnCancel && dlg.filter('.dialog-cancel').text(param.btnCancel || '取消').show().addClass('coocaa_btn')
	},
	eventHandler(e) {
		let ctx = e.data.ctx
		if ($(this).hasClass('dialog-confirm')) {
			ctx._param.onOK && ctx._param.onOK()
			ctx._param.onComplete && ctx._param.onComplete()
			ctx.hide(false)
			ctx._param.success()
		} else {
			ctx.hide()
		}		
    },
	_show(param) {
		this._param = param
		this._render()
		$('#dialog').show()
		let btns = $(`${this.id} .coocaa_btn`),
			defFocus = param.defFocus == 'cancel' ? '.dialog-cancel' : '.dialog-confirm'
		ccMap.init(btns, btns.filter(defFocus), "btn-focus")
		ccEvent.bindClick(btns, {ctx: this}, this.eventHandler)
	},
	show(param) {
		let that = this
		return new Promise((resolve, reject) => {
			that._show({
				...param,
				success() {
					resolve({confirm: true})
				},
				fail() {
					resolve({cancel: true}) //must resolve
				}
			})
		})
	},
	hide(flag=true) {
		if(flag) {
			//弹窗响应返回键时，需要执行跟按’取消‘键一样的流程：
			//如果有pending Promise, 需要处理,这样才能resolve旧弹窗，并显示后续弹窗
			this._param.onCancel && this._param.onCancel()
			this._param.onComplete && this._param.onComplete()
			this._param.fail()
		}
		$(this.id).find('.dialog-cancel').hide().removeClass('coocaa_btn')
		$('#dialog').hide()
	},
	isShow() {
		let dlg = null
		if($('#dialog').css('display') === 'none') return dlg;
		//找到当前显示的弹窗类型
		let dialoglist = {
			'common': ccDialog,
			'qrcode': ccQrCode,
			'entity-collected': ccEntityCollected,
			'coupon': ccCoupon,
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
	},

}

export default dialog