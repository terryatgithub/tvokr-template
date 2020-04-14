/**
 * 卡密弹窗
 * 继承普通弹窗
 */
import Dialog from './dialog.js'
import '../../css/coupon.scss'

 //ES5 实现 使用原型式继承
const CouponDialog = Object.create(Dialog)
CouponDialog.id = '#dialog .coupon'
CouponDialog._render = function() {
    let param = this._param
    let dlg = $(this.id).children()
    dlg.find('.title').text(param.title || '温馨提示')
    dlg.find('.tip').text(param.tip || '')
    dlg.find('.cardinfo.id').text(param.cardid)
    dlg.find('.cardinfo.pw').text(param.cardpw)
    dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
    dlg.filter('.dialog-cancel').text(param.btnCancel || '取消')
}
/**
 * 显示或隐藏二维码弹窗
 */
CouponDialog.toggleQr = function(flag) { 
    let action = flag ? 'show' : 'hide';
    $(this.id)[action]()
}
CouponDialog._show = function(param){
    this.toggleQr(true)
    Dialog._show.call(this, param)
    $('#dialog .common').hide()
}
CouponDialog.hide = function(flag){
    this.toggleQr(false)
    Dialog.hide.call(this, flag)
    $('#dialog .common').show()
}




//  //ES6实现
//  class CouponDialog extends Dialog{

//  }

 export default CouponDialog