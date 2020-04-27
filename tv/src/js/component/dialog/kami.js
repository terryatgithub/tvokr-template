/**
 * 卡密弹窗
 * 继承子弹窗
 */
import SubDialog from './subdialog.js'
import './kami.scss'
 
class KamiDialog extends SubDialog {
    
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
        dlg.find('.tip').text(param.tip || '')
        dlg.find('.cardinfo.id').text(param.cardid)
        dlg.find('.cardinfo.pw').text(param.cardpw)
        dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
        dlg.filter('.dialog-cancel').text(param.btnCancel || '取消')
    }
}

const kami = new KamiDialog('#dialog .kami')
export default kami