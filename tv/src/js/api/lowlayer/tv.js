/**
 * 酷开底层接口-中间件类
 * 根据业务需要封装底层api，封装了如初始化获取设备信息、登录信息
 */
 import lowlayer from './lowlayer.js'

class TVApi {
    static getInstance() {
        if(!this.instance) {
            this.instance = new TVApi()
        }
        return this.instance
    }

    constructor() {
        this.source = ""
    }

    /**
     * 
     * @param {*} isGetDevice 
     *      默认true，既获取设备信息、也获取用户信息
     *      false:用于用户登录状态发生改变后，只获取用户信息，不获取设备信息
     */
    async init(isGetDevice=true) { 
        console.log('ccAndroidSDK: ' + ccApp.ccAndroidSDK)
        let res
        if(isGetDevice) {
            if(ccApp.ccAndroidSDK >= 26) { //Android 8.0 采用非事件触发模式
                await this.setNativeToJsBridgeMode({mode: 1})
            }
            res = await this.getDeviceInfo()
            ccStore.setDeviceInfo(res.data)
            let pkg = 'com.tianci.movieplatform';
            res = await this.getAppInfo(pkg)
            ccStore.setHomepageVersion(res[pkg].versionCode)
            res = await this.getVideoSource()
            this.source = res.source
            ccStore.setSource(res.source)    
        }
        res = await this.getLoginStatus()
        ccStore.setHasLogin(res)
        if(res) {
            let p1 = this.getUserAccessToken()
            let p2 = this.getUserInfo()
            let [res1, res2] = await Promise.all([p1, p2]) 
            ccStore.setUserToken(res1.data.accesstoken)
            ccStore.setUserInfo(res2.data)
        }
    }

    /**
     * 登录接口,需要用户登录时调用
     * @returns 
     *      如果已登录，返回true
     *      如果未登录，调起登录页面后返回 logining
     *      如果出错，返回false
     *      （在监听页面登录addLoginChangedListener里的回调函数里获取登录结果)
     */
    async login() {
        let source = this.source, res
        res = await this.getLoginStatus(false)
        console.log(`${JSON.stringify(res)}`)
        if(!res.hasLogin) {
            res = await lowlayer.startLogin({
                source,
                tencentType: res.tencentType
            })
            console.log(`startLogin: ${JSON.stringify(res)}`)
            //去登陆，起登录页面，startLogin函数就跑完了；然后需要onresume里监听登录状态变化
            console.log('调起登录页面')
            return res = false
        } else {
            console.log('原本已登录: ', res)
            res = true                              
        }
        return res
    }

    /**
     * 获取本机视频源
     */
    async getVideoSource() {
        if(!this.source) {
            this.source = await lowlayer.getVideoSource()
        }
        return this.source
    }

    /**
     * 获取设备信息
     */
    async getDeviceInfo() {
        if(!this.deviceInfo) {
            this.deviceInfo = await lowlayer.getDeviceInfo()
        }
        return this.deviceInfo
    }

    /**
     * @param {*} 要获取的apk 包名
     */
    async getAppInfo(apkPkgName) {
        let param = {
            pkgList: [apkPkgName] // 'com.tianci.movieplatform'
        },
        res = await lowlayer.getAppInfo(param)
        return JSON.parse(res.data)
    }

    /**
     * 获取登录状态
     */
    async getLoginStatus(flag=true) {
        let source = this.source,
            res = await lowlayer.getLoginStatus({source})
        return flag ? res.data.hasLogin : res.data
    }

    /**
     * 获取用户登录方式及第三方openid
     */
    _getLoginInfo(user) {
        let ret = null;
        if(!user) {
            console.log('pls login first.')
            return ret
        }
        if (user.external_info) {
            user = JSON.parse(user.external_info)
            user.find(k => {
                if(k.login) {
                    let loginType = 0
                    switch(k.external_flag) {
                        case 'qq':      loginType = 1; break;
                        case 'weixin':  loginType = 2; break;
                    }
                    ret = {
                        thirdUserId: k.external_id, //第三方openId
                        vuserid: k.vuserid, //微信openId 如果有的话必须
                        loginFlag: k.external_flag,  //qq / weixin 
                        loginType
                    }
                    return true
                }
            })
        }
        return ret
    }

    /**
     * 添加用户登录状态改变事件的回调函数
     * @param {function} cb 
     */
    addLoginChangedListener(cb) {
        return lowlayer.addLoginChangedListener(cb)
    }
    
    addPayChangedListener(cb) {
        return lowlayer.addPayChangedListener(cb)
    }
    
    /**
     * 获取用户信息
     */
    async getUserInfo() {
        let res = await lowlayer.getUserInfo()
        Object.assign(res.data, this._getLoginInfo(res.data))
        return res
    }

    /**
     * 获取用户token
     */
    getUserAccessToken() {
        return lowlayer.getUserAccessToken()
    }

    /**
     * 进入商品购买详情页
     * @param {object} param {id: '123'} //商品id
     */
    startAppStoreDetail(param) {
        return lowlayer.startAppStoreDetail(param)
    }

    /**
     * 进入产品包购买页
     */
    startMovieMemberCenter(param) {
        return lowlayer.startMovieMemberCenter(param)
    }

    /**
     * 启动第三方应用
     */
    startCommonPage(param) {
        return lowlayer.startCommonPage(param)
    }

    /**
     * 购物商城详情页
     * @param {*} param 
     */
    startMallDetail(param) {
        return lowlayer.startMallDetail(param)
    }

    startMallOrderDetail(param) {
        return lowlayer.startMallOrderDetail(param)
    }

    logDataCollection(param) {
        return lowlayer.logDataCollection(param)
    }

    setNativeToJsBridgeMode(param) {
        return lowlayer.setNativeToJsBridgeMode(param)
    }

}

let inst = TVApi.getInstance()

export default inst