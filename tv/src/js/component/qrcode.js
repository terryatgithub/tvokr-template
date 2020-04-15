/**
 * 二维码弹窗
 * 继承普通弹窗
 */
import Dialog from './dialog.js'
import '../../css/qrcode.scss'

//ES5 实现 使用原型式继承
const QrCodeDialog = Object.create(Dialog)
QrCodeDialog.id = '#dialog .qrcode'
QrCodeDialog._render = function() {
    let param = this._param
    let dlg = $(this.id).children()
    dlg.find('.title').text(param.title || '温馨提示')
    dlg.find('.icon').attr('src', param.icon)
    dlg.find('.tip').text(param.tip || '')
    dlg.find('.detail').html(param.detail || '请微信扫码完善收货信息<br>奖品将送达您手中')
    dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
    dlg.filter('.dialog-cancel').text(param.btnCancel || '取消')
}
/**
 * 显示或隐藏二维码弹窗
 */
QrCodeDialog.toggleQr = function(flag) { 
    let action = flag ? 'show' : 'hide';
    $(this.id)[action]()
}
QrCodeDialog._show = function(param){
    this.toggleQr(true)
    Dialog._show.call(this, param)
    $('#dialog .common').hide()
}
QrCodeDialog.hide = function(flag){
    this.toggleQr(false)
    Dialog.hide.call(this, flag)
    $('#dialog .common').show()
}

 export default QrCodeDialog