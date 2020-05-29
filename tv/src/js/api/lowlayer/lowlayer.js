/**
 *  酷开底层接口，酷开系统提供的底层能力，
 *  不做逻辑处理，仅封装为Promise形式
 */
import util from "../../util"

 class LowLayerApi {
    static getInstance() {
        if (!this.instance) {
            this.instance = new LowLayerApi()
        }
        return this.instance
    }
    constructor() {
        //
    }

    getVideoSource() {
        return new Promise((resolve, reject) => {
            ccApp.getVideoSource({
                success: msg => resolve(msg),
                fail: (err) => resolve(err),
                complete: () => {}
            })
        })
    }

    getDeviceInfo() {
        return new Promise((resolve, reject) => {
            //获取设备信息
            ccApp.getDeviceInfo({
                success: (res) => resolve(res),
                fail: (err) => resolve(err),
                complete: () => {}
            })
        })
    }

    getLoginStatus(param) {
        return new Promise((resolve, reject) => {
            ccApp.getLoginStatus({
                ...param,
                success: msg => resolve(msg),
                fail: err => resolve(err),
                complete: () => {}
            })
        })
    }

    startLogin(param) {
        return new Promise((resolve, reject) => {
            ccApp.startLogin({
                ...param,
                success: msg => resolve(msg),
                fail: err => resolve(err),
                complete: () => {}
            })
        })
    }
    
    addLoginChangedListener(cb) {
        return new Promise((resolve, reject) => {
            ccApp.addLoginChangedListener({
                onReceive: cb,
                success: msg => resolve(msg)
            })
        })
    }

    addPayChangedListener(cb) {
        return new Promise((resolve, reject) => {
            ccApp.addPayChangedListener({
                onReceive: cb,
                success: msg => resolve(msg)
            })
        })
    }
    
    getUserInfo() {
        return new Promise((resolve, reject) => {
			ccApp.getUserInfo({
				success: (msg) => resolve(msg),
                fail: (err) => resolve(err),
                complete: () => {}
			})
        })
    }

    getUserAccessToken() {
        return new Promise((resolve, reject) => {
            ccApp.getUserAccessToken({
				success: (msg) => resolve(msg),
                fail: (err) => resolve(err),
                complete: () => {}
			})
        })
    }

    startTVSetting() {
        return new Promise((resolve, reject) => {
            ccApp.startTVSetting({
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    startAppStoreDetail(param) {
        return new Promise((resolve,reject) => {
            ccApp.startAppStoreDetail({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    startMovieMemberCenter(param) {
        return new Promise((resolve,reject) => {
            ccApp.startMovieMemberCenter({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }
    
    getAppInfo(param) {
        console.log(param);
        if(ccDebug.isPCMode() || util.isMockMode()) { //todo 
            return {
                data: JSON.stringify({
                    "com.lutongnet.ott.health":{"status":"-1","versionName":"1.17.38","versionCode":1170038},
                    "air.com.gongfubb.wk123.tv":{"status":"0","versionName":"2.14.38","versionCode":2140038},
                    "cn.cheerz.icw":{"status":"0","versionName":"2.3.38","versionCode":2030038},
                    "com.an.tv":{"status":"-1","versionName":"7.14.38","versionCode":7140038},
                    "com.potato.answer":{"status":"0","versionName":"7.14.38","versionCode":7140038},
                    "com.lutongnet.ott.ggly":{"status":"-1","versionName":"7.14.38","versionCode":7140038},
                    "com.coocaa.mall":{"status":"0","versionName":"7.14.38","versionCode":7140038},
                    "com.coocaa.app_browser":{"status":"0","versionName":"7.14.38","versionCode":7140038},
                    "com.coocaa.activecenter":{"status":"1","versionName":"7.14.38","versionCode":7140038},
                    "com.tianci.movieplatform":{"status":"1","versionName":"7.14.38","versionCode":7140038}})
            }
        }
        return new Promise((resolve,reject) => {
            ccApp.getAppInfo({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 启动第三方应用
     * @param {} param 
     */
    startCommonPage(param) {
        console.log("lowlayer startCommonPage:"+JSON.stringify(param))
        return new Promise((resolve,reject) => {
            ccApp.startCommonPage({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 启动购物商城详情页
     * @param {} param 
     */
    startMallDetail(param) {
        return new Promise((resolve,reject) => {
            ccApp.startMallDetail({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }
    /**
     * 启动购物商城-订单支付详情页
     * @param {} param 
     */
    startMallOrderDetail(param) {
        return new Promise((resolve,reject) => {
            ccApp.startMallOrderDetail({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }
    

    logDataCollection(param) {
        return new Promise((resolve,reject) => {
            ccApp.logDataCollection({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 设置跟底层的通信模式
     * @param {*} param 
     */
    setNativeToJsBridgeMode(param) {
        return new Promise((resolve,reject) => {
            ccApp.setNativeToJsBridgeMode({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 启动购物商城详情页
     * @param {} param 
     */
    startHomeSpecial(param) {
        return new Promise((resolve,reject) => {
            ccApp.startHomeSpecial({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 创建下载任务
     * @param {} param 
     */
    createDownloadTask(param) {
        return new Promise((resolve,reject) => {
            ccApp.createDownloadTask({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 删除下载任务
     * @param {} param 
     */
    deleteDownloadTask(param) {
        return new Promise((resolve,reject) => {
            ccApp.deleteDownloadTask({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 暂停下载任务
     * @param {} param 
     */
    pauseDownloadTask(param) {
        return new Promise((resolve,reject) => {
            ccApp.pauseDownloadTask({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 继续下载任务
     * @param {} param 
     */
    resumeDownloadTask(param) {
        return new Promise((resolve,reject) => {
            ccApp.resumeDownloadTask({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

    /**
     * 下载任务状态监听
     * @param {} cb 
     */
    addDownloadChangedListener(cb) {
        return new Promise((resolve,reject) => {
            ccApp.addDownloadChangedListener({
                onReceive: cb,
                success: msg => resolve(msg)
            })
        })
    }

    /**
     * 删除下载任务状态监听
     * @param {} param 
     */
    removeDownloadChangedListener(param) {
        return new Promise((resolve,reject) => {
            ccApp.removeDownloadChangedListener({
                ...param,
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }

     /**
     * 获取设备存储空间信息，包括磁盘和内存信息
     */
    getMemInfo() {
        return new Promise((resolve,reject) => {
            ccApp.getMemInfo({
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }
    /**
     * 启小程序
     */
    startAppX() {
        return new Promise((resolve,reject) => {
            ccApp.startAppX({
                success: res => resolve(res),
                fail: (err) => resolve(err),
                complete: () => resolve()
            })
        })
    }
}

let ccLowLayerApiInst = LowLayerApi.getInstance()

export default ccLowLayerApiInst