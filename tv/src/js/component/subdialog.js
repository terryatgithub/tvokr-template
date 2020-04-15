/**
 * 二维码弹窗
 * 继承普通弹窗
 */
import dialog, {Dialog} from './dialog.js'

class SubDialog extends Dialog {
        
    constructor(selector) {
        super(selector)
    }

    /**
     * 重载父类hide()
     * @param {Boolean} flag 
     */
    hide(flag){
        this._toggle(false)
        super.hide(flag)
        $(dialog.id).show() //默认显示通用对话框
    }
    /**
     * 重载父类_show()
     * @param {Object} param 
     */
    _show(param){
        this._toggle(true)
        super._show(param)
        $(dialog.id).hide() //隐藏默认显示的通用对话框
    }
    /**
     * 显示或隐藏子弹窗
     * @param {Booelan} flag 
     */
    _toggle(flag) { 
        let action = flag ? 'show' : 'hide';
        $(this.id)[action]()
    }
}

export default SubDialog