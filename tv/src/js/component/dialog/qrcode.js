/**
 * 二维码弹窗
 * 继承普通弹窗
 */
import SubDialog from './subdialog.js'
import './qrcode.scss'

class QrCodeDialog extends SubDialog {

    constructor(selector) {
        super(selector)
    }

    /**
     * 重载父类_render()
     */
    _render() {
        let param = this._param
        let dlg = $(this.id).children()
        dlg.find('.title').text(param.title || '温馨提示')
        dlg.find('.icon').attr('src', param.icon)
        dlg.find('.tip').text(param.tip || '')
        dlg.find('.detail').html(param.detail || '请微信扫码完善收货信息<br>奖品将送达您手中')
        dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
        dlg.filter('.dialog-cancel').text(param.btnCancel || '取消')
    }
}

const qrcode = new QrCodeDialog('#dialog .qrcode')
export default qrcode