import urls from './url.js'

const _urls = {
    getSeckillGoodsList: urls.shopingUrl + '/tvTopicAPI/platformActivityList',
    getSeckillState: urls.shopingUrl + '/tvOrderAPI/v1/actStatus',
    findOrderByAct: urls.shopingUrl + '/tvOrderAPI/v1/findOrderByAct',
    getSecKillMyList: urls.shopingUrl + '/tvOrderAPI/v1/actOrderList'
}

class ShoppingBackendApi {
    static getInstance() {
        if(!this.instance) {
            this.instance = new ShoppingBackendApi()
        }
        return this.instance
    }

    constructor() {
        //
    }
    
    /**
     * 获取活动平台-今日秒杀活动列表
     * @param {day} number 获取当天秒杀产品列表 1:第二天 -1:前一天 以此类推
     * @param {source} string 视频源
     */
    async getSeckillGoodsList({source='yinhe', day=0}) {
        console.log('seckill getSeckillGoodsList')
        let after = parseInt(day,0)
        after = isNaN(after) ? 0 : after
        let data = {
            t: (+new Date()).toString().slice(0,10),
            sourceType: source,
            after
        }
        data = {
            param: JSON.stringify(data)
        }
        let url = _urls.getSeckillGoodsList
        let res = await ccUtil.get({url, data})
        return res
    }

    /**
     * 获取用户是否参与此场秒杀活动
     * @param {object} param0 
     */
    async getSeckillState() {
        let data = {
            openId: ccStore.state.userInfo.open_id,
            actIds: ccStore.state.seckillGoodsInfo.seckillGoodsId
        }
        data = {
            param: JSON.stringify(data)
        }
        let url = _urls.getSeckillState
        let res = await ccUtil.get({url, data})
        return res
    }

    /**
     * 获取TV购物用户是否参与秒杀活动下单状态说明
     * @param {object} param0 
     */
    async findOrderByAct(actId) {
        let data = {
            openId: ccStore.state.userInfo.open_id,
            actId
        }
        data = {
            param: JSON.stringify(data)
        }
        let url = _urls.findOrderByAct
        let res = await ccUtil.get({url, data})
        return res
    }
    
    /**
     * 获取我的秒杀列表
     * @param {object} param0 
     */
    async getSecKillMyList() {
        let data = {
            openId: ccStore.state.userInfo.open_id,
            startDate: ccStore.state.actPeriod.start,
            endDate: ccStore.state.actPeriod.end,            
        }
        data = {
            param: JSON.stringify(data)
        }
        let url = _urls.getSecKillMyList
        let res = await ccUtil.get({url, data})
        return res
    }

}

let inst = ShoppingBackendApi.getInstance()

export default inst