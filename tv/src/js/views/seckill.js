import ccView from './view.js'
import '../../css/seckill.scss'

class SeckillPage extends ccView{
    
    constructor(selector) {
        super(selector)
        this.name = 'seckill page'
        this.data = {
        }
    }

     /**
     * 生命周期函数 created 
     * 首次进入页面调用
     */
    async created() {
		console.log('--seckillPage created')
        $(this.id).show()
        this.bindKeys()
    }
    
    /**
     * 生命周期函数 destroyed 
     * 退出页面时调用
     */
	destroyed() {
		console.log('--seckillPage destroyed')
		$(this.id).hide()
    }

    /**
     * 点击事件回调函数
     * @param {Event} e 
     */
    async onClick(e) {
        ccRouter.push('home?focus=seckill')
    }

    /**
     * onFocus
     * @param {Event} e 
     */
    async onFocus(e) {
        // let ctx = e.data.ctx;
    }

}

const seckillPage = new SeckillPage('#seckillPage')
export default seckillPage
