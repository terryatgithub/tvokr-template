/**
 * 微信公众号后台接口
 */
import urls from './url.js'

const _urls = {
    getTmpQrcode: urls.wxUrl + 'qrcode/getTmpQrcode' //获取临时二维码接口
}

class WechatBackendApi {
    static getInstance() {
        if(!this.instance) {
            this.instance = new WechatBackendApi()
        }
        return this.instance
    }

    constructor() {
        //
    }

    /**
     * 返回微信公众号默认二维码url
     */
    getDefaultUrl() {
        return urls.wxPublicAccountDefaultUrl
    }

    /**
     * 获取微信公众号二维码
     * @param {} position 418活动有2个位置显示二维码，移动端需要知道从哪个进来的
     */
    async getTmpQrcode(position) {
        console.log('wx getTmpQrcode.')
        let {
            source,
            deviceInfo: {
                model: deviceModel,
                chip: deviceChip,
                mac: deviceMac,
                activeid: serviceId    
            },
            userInfo: {
                open_id: openid
            },
            userToken: token
        } = ccStore.state;
        let param = {
            appId: urls.wxAppId,
            source,
            deviceModel,
            deviceChip,
            deviceMac,
            serviceId,
            token,
            type: 'SPEC_TEXT_2020418', //活动前跟微信后台确认
            time: Math.round(new Date().getTime() / 1000).toString()
        },
        content = { //传递给移动端页面的参数
            c: deviceChip,
            m: deviceModel,
            tui: ccStore.state.userInfo.thirdUserId,
            vui: ccStore.state.userInfo.vuserid,
            lf: ccStore.state.userInfo.loginFlag,
            cid: openid,
            mac: deviceMac,
            aid: serviceId,
            s: source === 'tencent' ? `t${position}` : `i${position}`,
            h: ccStore.state.homepageVersion,
            at: ccStore.state.userToken,
            gfid: ccStore.state.actId.divid,
            cjid: ccStore.state.actId.draw,
        }
        param.content = JSON.stringify(content)
        param = JSON.stringify(param)
        let res = await ccUtil.get({
            url: _urls.getTmpQrcode,
            data: {param: param}
        })
        return res
    }

}


let inst = WechatBackendApi.getInstance()

export default inst