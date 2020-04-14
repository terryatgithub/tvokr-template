import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/route.js'
import '../../css/seckill.scss'

var seckillPage = new ccView({
	name: 'seckill',
	id: '#seckillPage',
	data: {
		title: 'seckillPage title',
		tips: 'this is some text used to placeholding............'
    },
    getBtns() {
        return (`${this.id} .coocaa_btn`)
    },
    async clickEventHandler(e) {
        let type = $(this).attr('data-type');
        console.log(`hoseckillPageme clickEventHandler event target: ${event.target.id}`)
        if(type !== 'goods') { //去参与活动按钮
            router.push('home?focus=seckill')
            ccData.submitLogClick({
                page_name: '我的秒杀页',
                activity_stage: ccData.activity_stage,
                button_name: '去参加活动'
            }) 
        } 
    },
    async focusEventHandler(e) {
        // let ctx = e.data.ctx;
    },
    bindKeys() {
        let btns = $(this.getBtns())
		ccMap.init(btns, btns[0], "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.clickEventHandler)
        ccEvent.bindFocus(btns, {ctx:this}, this.focusEventHandler)
    },
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
        await this._getSecKillMyList()
        this.bindKeys()
	},
	destroyed() {
		console.log('--seckillPage destroyed')
		$(this.id).hide()
    },
    async _getSecKillMyList() {
        let res = await ccApi.backend.shopping.getSecKillMyList()
        console.log('我的秒杀：' + res)
        res = JSON.parse(res)
        if(!(res.returnCode === '200' || res.returnCode === '300001')) {
            ccToast.show('提示<br>网络异常请重新进入')
            return
        }
        this._updatePageInfo(res.data)
        ccData.submitLogShow({
            page_name: '我的秒杀页',
            page_state: res.data && res.data.length ? '已有秒杀订单' : '未有秒杀订单',
            activity_stage: ccData.activity_stage
        })   
    },
    _updatePageInfo(list) {
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
})

export default seckillPage