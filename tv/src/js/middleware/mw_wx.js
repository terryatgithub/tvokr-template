/**
 * 微信后台接口模块-中间件层
 * 封装跟业务逻辑相关的处理
 */
import backend from '../api/backend/index.js'

class WechatApi {
    constructor() {

    }

    /**
     * 获取微信公众号二维码
     * @param {Number} position 418活动有2个位置显示二维码，移动端需要知道从哪个进来的
     */
    async getTmpQrcode(position) {
        return backend.wx.getTmpQrcode(position)
    }

    /**
     * 返回微信公众号默认二维码url
     */
    getDefaultUrl() {
        return backend.wx.getDefaultUrl()
    }

}

const wechat = new WechatApi()
export default wechat