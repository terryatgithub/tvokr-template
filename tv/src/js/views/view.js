/**
 * 页面纯基类，不能被实例化,只能被继承
 */
import ccEvent from '../eventhandler/index.js'

class View {

    constructor(selector) {
        console.log('new View.')
        if(new.target === View) {
            throw new Error('View is an abstract class, can NOT be instanced.')
        }
        this.id = selector //当前页面对应的选择器ID
        this.coocaaBtns = `${selector} .coocaa_btn` //当前页面可落焦按钮
        this.curFocus = 0 //当前页面焦点
    }
        
    /**
     * 页面初始化
     * @param {String} hash 路由hash，可能带参数
     * 比如 'home?focus=seckill'
     */
    async init(hash) {
        console.log(`View init, page name:${this.name}`)
        this.created && await this.created(hash)
    }
    
    /**
     * 页面反初始化
     */
    uninit() {
        console.log(`View uninit, page name:${this.name}`)
        this.destroyed && this.destroyed()
    }

    /**
     * 查看当前页面是否处于显示状态
     */
    isShow() {
		return $(this.id).css('display') !== 'none'
    }
        
    /**
     * 绑定当前页面按钮
     */
    bindKeys() {
        let btns = $(this.coocaaBtns)
        ccMap.init(btns, btns[this.curFocus], "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.onClick)
        ccEvent.bindFocus(btns, {ctx:this}, this.onFocus)
    }

    /**
     * 解绑按钮
     */
    _unbindKeys() {
        ccMap.init('', '', "")
        ccEvent.unbindAllKeys($(this.coocaaBtns))
    }
    
}

export default View