/**
 * 页面纯基类，不能被实例化,只能被继承
 */
import ccmap from '@ccos/ccmap'
import ccEvent from '../eventhandler/index.js'

class View {

    constructor(selector) {
        console.log('new View.')
        if(new.target === View) {
            throw new Error('View is an abstract class, can NOT be instanced.')
        }
        this.id = selector //当前页面对应的选择器ID
        this.coocaaBtns = `${selector} .coocaa_btn:visible` //当前页面可落焦按钮
        this.curFocus = 0 //当前页面焦点
    }
        
    /**
     * 页面初始化
     * @param {String} hash 路由hash，可能带参数
     * 比如 'home?focus=seckill'
     */
    async init({hash=null, bInit=true} = {}) {
        console.log(`View init, page name:${this.name}`)
        this.hashParam = hash
        this.created && await this.created(hash, bInit)
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
        console.log("bindKeys");
        let btns = $(this.coocaaBtns), 
            wantedFocus = null;
        if (this.hashParam) { //如果有指定焦点
            let tmp = this._jumpSpecifiedFocus(this.hashParam) 
            if (tmp) {
                wantedFocus = btns.index($(`#${tmp}`))
            }
        }
        this.curFocus = wantedFocus || this.curFocus
        this.hashParam = null
        ccmap.init(btns, btns[this.curFocus], "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.onClick)
        ccEvent.bindFocus(btns, {ctx:this}, this.onFocus)
    }

    /**
     * 解绑按钮
     */
    _unbindKeys() {
        ccmap.init('', '', "")
        ccEvent.unbindAllKeys($(this.coocaaBtns))
    }

    /**
     * 复位页面焦点到指定按钮，默认复位到index为0的按钮
     * @param {*} focus 
     */
    _resetFocus(focus) {
        let btns = $(this.coocaaBtns), f;
        if(focus) {
            this.curFocus = $(this.coocaaBtns).index(focus);
        } 
        f = focus || $(btns[this.curFocus])
        ccmap.init(btns, f, "btn-focus")
        f.trigger('itemFocus')
    }

    /**
     *页面内部跳转时，跳转到指定焦点(目前只支持跳到指定ID)
     * @param {*} hash 内部跳转的hash字符串全部（比如 router.push('home?focus=goBuyVip')
     */
    _jumpSpecifiedFocus(str) {
        let ret = null 
        if(!str) return 
        str = str.split('&')
        str.find(item => {
            item = item.split('=')
            if(item[0] === 'focus') { 
                // this._resetFocus($(`#${item[1]}`))
                // return true
                ret = item[1]
                return item[1]
            }
        })
        return ret
    }

     /**
     * 登录后自动触发之前的点击操作
     */
    _autoTriggerClick() {
        let btns = $(this.coocaaBtns), f;
        f = $(btns[this.curFocus])
        f.trigger('itemClick')
    }
}

export default View