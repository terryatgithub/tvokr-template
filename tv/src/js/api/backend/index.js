/**
 * 后台接口封装层
 */
import act from './activity.js'
import shopping from './shopping.js'
import wx from './wx.js'

class BackendApi {
    static getInstance() {
        if(!this.instance) {
            this.instance = new BackendApi()
        }
        return this.instance
    }

    constructor() {
        this.act = act  //活动后台接口
        this.shopping = shopping    //秒杀后台接口
        this.wx = wx    //微信后台接口
    }

}

let backendApiInst = BackendApi.getInstance()

export default backendApiInst