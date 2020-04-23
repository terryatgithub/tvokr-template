import ccView from './view.js'
import '../../css/award.scss'

class AwardPage extends ccView{

    constructor(selector) {
        super(selector)
        this.name = 'award page'
        this.data = {
        }
    }

    /**
     * 生命周期函数 created 
     * 首次进入页面调用
     */
	async created() {
		console.log('--awardPage created')
        $(this.id).show()
        this.bindKeys()
    }
    
    /**
     * 生命周期函数 destroyed 
     * 退出页面时调用
     */
    destroyed() {
        console.log('--awardPage destroyed')
        //焦点复位到页面顶部
        this.curFocus = 0
        $(`${this.id} .scroll-wrapper`).scrollTop(0)
        this._resetFocus()
        $(this.id).hide()
    }
    
    /**
     * 点击事件回调函数
     * @param {Event} e 
     */
    async onClick(e) {
        let ctx = e.data.ctx
        ccRouter.push('home')
    }

    /**
     * onFocus
     * @param {Event} e 
     */
    async onFocus(e) {
        let ctx = e.data.ctx
    }

}

const awardPage = new AwardPage('#awardPage')
export default awardPage