/**
 * 实体奖已领取弹窗
 * 继承普通弹窗
 */
import SubDialog from './subdialog.js'
import '../../css/entitycollected.scss'

class EntityCollectedDialog extends SubDialog {
	
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
        dlg.find('.detail').html(param.detail || '请微信扫码完善收获信息，奖品将送达您手中')
        dlg.filter('.dialog-confirm').text(param.btnOK || '确认')
        dlg.filter('.dialog-cancel').text(param.btnCancel || '取消')    }
}

const entityCollected = new EntityCollectedDialog('#dialog .entity-collected')
export default entityCollected