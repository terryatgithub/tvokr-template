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
        this.act = act
        this.shopping = shopping
        this.wx = wx
    }

}

let backendApiInst = BackendApi.getInstance()

export default backendApiInst