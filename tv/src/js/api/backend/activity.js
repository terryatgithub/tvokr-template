/**
 * 活动后台接口
 */
import urls from './url.js'
import md5 from 'md5'

const _urls = {
    init: urls.actUrl + 'building/v2/web/init', //活动初始化接口
    actSetCrowdUrl: urls.actUrl + 'building/partition/set-crowd', //设置人群接口
    getDayLeft: urls.actUrl + 'building/partition/day-info', //获取瓜分活动剩余天数
    draw: urls.drawLLuckUrl + 'building/v2/web/start', //抽奖接口
    getMyReward: urls.drawLLuckUrl + 'building/v2/web/u-award', //我的奖品
    receiveMyReward: urls.drawLLuckUrl + 'v4/lottery/verify/receive', //领奖
    getLuckyNews: urls.lucyNewsUrl + 'v2/web/tv-new', //中将喜讯
}

class ActivityBackendApi {
    static getInstance() {
        if(!this.instance) {
            this.instance = new ActivityBackendApi()
        }
        return this.instance
    }

    constructor() {
    }
    
    /**
     * 初始化瓜分
     */
    async initDividTask() {
        console.log('act divid init')
        let data = ccStore.getters.commonParam(),
            token = `i=${data.cUDID}&cu=${data.cOpenId}&mac=${data.cModel}&cm=${data.cChip}&cc=${data.id}&uu=${data.MAC}&gnTzIdesKHE2QBYw`;
        data.token = md5(token)
        let res = await ccUtil.post({
            url: _urls.init,
            data
        })
        return res
    }
    /**
     * 设置人群接口
     */
    async actSetCrowd() {
        console.log('act divid actSetCrowdUrl')
        let param = {
            headerVersion: ccStore.state.homepageVersion,
            Resolution: '',
            cSize: '',
            cFMode: '',
            cServerAddress: '',
            cAppVersion: '',
            cSkySecurity: false,
            supportSource: '',
            cEmmcCID: '',
            cCustomId: '',
            language: '',
            vAppID: '',
            country: '',
            aSdk: '',
            cTcVersion: ''
        }
        let res = await ccUtil.get({
            url: _urls.actSetCrowdUrl,
            data: ccStore.getters.commonParam(),
            ...param // todo 
        })
        return res
    }
    /**
     * 获取瓜分剩余天数
     */
    async getDividDaysLeft(){
        console.log('act getDayLeft')
        let res = await ccUtil.get({
            url: _urls.getDayLeft,
            data: ccStore.getters.commonParam()
        })
        return res
    }

    /**
     * 初始化抽奖
     */
    async initDrawTask() {
        console.log('act draw init')
        let data = {
                ...ccStore.getters.commonParam(),
                id: ccStore.state.actId.draw, //活动id跟瓜分活动不同
                originType: 'task'
            },
            token = `i=${data.cUDID}&cu=${data.cOpenId}&mac=${data.cModel}&cm=${data.cChip}&cc=${data.id}&uu=${data.MAC}&gnTzIdesKHE2QBYw`;
        data.token = md5(token)

        let res = await ccUtil.post({
            url: _urls.init,
            data
        })
        return res
    }

    /**
     * 抽奖
     * @param {boolean} type 
     */
    async doLuckDraw(type) {
        console.log('act doLuckDraw')
        let data = {
                ...ccStore.getters.commonParam(),
                id: type ? ccStore.state.actId.divid : ccStore.state.actId.draw,
                originType: type ? '' : 'task'
            },
        token = `i=${data.cUDID}&cu=${data.cOpenId}&mac=${data.cModel}&cm=${data.cChip}&cc=${data.id}&uu=${data.MAC}&k=${data.userKeyId}&2mstq8PkTGnuq6fv`;
        data.token = md5(token)
        let res = await ccUtil.post({
            url: _urls.draw,
            data
        })
        return res
    }

    /**
     * 领奖
     * @param {object} awardInfo 传入领取的奖品信息
     */
    async receiveMyReward(awardInfo) {
        console.log('act receive reward') 
        let data = {
                ...ccStore.getters.commonParam(),
                id: ccStore.state.actId.draw,
                ...awardInfo
            },
            token = `aw=${data.rememberId}&re=${data.userKeyId}&u=${data.awardTypeId}&t=${data.activeId}&p=${data.cOpenId}&0y8LiSu7DNcIUqlW`;
        data.token = md5(token)
        let res = await ccUtil.get({
            url: _urls.receiveMyReward,
            data
        })
        return res
    }

    /**
     * 获取我的奖品列表
     */
    async getMyReward(type) {
        console.log('act getMyReward')
        let res = await ccUtil.get({
            url: _urls.getMyReward,
            data: {
                ...ccStore.getters.commonParam(),
                id: type ? ccStore.state.actId.divid : ccStore.state.actId.draw
            }
        })
        return res
    }    

    /**
     * 获取中奖喜讯
     */
    async getLuckyNews() {
        console.log('act getLuckyNews') 
        let res = await ccUtil.get({
            url: _urls.getLuckyNews,
            data: {
                id: ccStore.state.actId.draw
            }
        })
        return res
    }
}

let inst = ActivityBackendApi.getInstance()

export default inst