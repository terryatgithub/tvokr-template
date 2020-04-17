import ccView from './view.js'
import router from '../router/index.js'
import mw from '../middleware/index.js'
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
        let isEnd = ccStore.state.actStates === 'end',
            tipActEnd = isEnd ? '活动已结束，欢迎下次参与~' : '暂无秒杀商品，快去参加活动吧~',
            empty = `<div class="empty-wrapper">
                        <div class="tips">${tipActEnd}</div>
                        ${ isEnd ? '' : '<div class="coocaa_btn btn"></div>'}
                    </div>`
        $('#seckillPageMyList').empty().html(empty)
        await this._showMySeckillGoods()
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
        let type = $(this).attr('data-type');
        console.log(`hoseckillPageme onClick event target: ${event.target.id}`)
        if(type !== 'goods') { //去参与活动按钮
            router.push('home?focus=seckill')
            ccData.submitLogClick({
                page_name: '我的秒杀页',
                activity_stage: ccData.activity_stage,
                button_name: '去参加活动'
            }) 
        } 
    }

    /**
     * onFocus
     * @param {Event} e 
     */
    async onFocus(e) {
        // let ctx = e.data.ctx;
    }

    /**
     * 显示我的秒杀商品
     */
    async _showMySeckillGoods() {  
        let res = await mw.seckill.getMySecKillList()
        res && this._renderPage(res.data)
    }

    /**
     * 渲染页面
     * @param {Array[Object]} list 秒杀商品列表 
     */
    _renderPage(list) {
        if(!list || !list.length) { return }
        let header = `<ul>`,
            body = '',
            footer = `</ul>`;    
        body = list.reduce((prev, cur) => {
                let li = `<li class="coocaa_btn" data-type="goods">
                            <img src="${cur.goodsImg}"/>
                            <div class="title text">${cur.goodsName}</div>
                            <div class="price text">${cur.shopPrice}元  X1</div>
                            <div class="address-zone">
                                <div>订单号: <span>${cur.orderSn}</span></div>
                                <div>姓  名: <span>${cur.consignee}</span></div>
                                <div>手机号: <span>${cur.mobile}</span></div>
                                <div>收货地址: <span>${cur.address}</span></div>
                            </div>>
                        </li>`
                return prev + li
            }, '')
        $('#seckillPageMyList').empty().html(header + body + footer)
    }
}

const seckillPage = new SeckillPage('#seckillPage')
export default seckillPage
