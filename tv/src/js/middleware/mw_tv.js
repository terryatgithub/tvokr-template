/**
 * 酷开底层接口-中间件类
 * 根据业务需要封装底层api，封装了如初始化获取设备信息、登录信息
 */
 import lowlayer from '../api/lowlayer/lowlayer.js'
 import urls from './../api/backend/url.js'

class TVApi {
    static getInstance() {
        if(!this.instance) {
            this.instance = new TVApi()
        }
        return this.instance
    }

    constructor() {
        this.tvsource = ""
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
            let pkg = ['com.tianci.movieplatform'];
            res = await this.getAppInfo(pkg)
            ccStore.setGlobalVar("homepageVersion",res[pkg].versionCode,"");
            res = await this.getVideoSource()
            this.tvsource = res.source 
            ccStore.setGlobalVar("tvsource",res.source,"yinghe");
        }
        res = await this.getLoginStatus()
        console.log(res);
        ccStore.setGlobalVar("loginstatus",res,"false");
        if(res) {
            let p1 = this.getUserAccessToken()
            let p2 = this.getUserInfo()
            let [res1, res2] = await Promise.all([p1, p2])
            ccStore.setGlobalVar("userToken",res1.data.accesstoken,"");
            console.log(res1.data.accesstoken);
            ccStore.setUserInfo(res2.data)
        }
    }
     
    /**
      * 登录
      */
     goLogin() {
        //ccToast.show('提示<br>请先登录~~')
        ccStore.setGlobalVar("goLoginPage",true,false);
        ccData.submitLogShowLogin({
            page_name: '2020618看电视赚现金登录弹窗',
            page_type: 'inactivityWindows'
        }) 
        this._login()
    }

    /**
     * 登录接口,需要用户登录时调用
     * @returns 
     *      如果已登录，返回true
     *      如果未登录，调起登录页面后返回 logining
     *      如果出错，返回false
     *      （在监听页面登录addLoginChangedListener里的回调函数里获取登录结果)
     */
    async _login() {
        let source = this.tvsource, res
        res = await this.getLoginStatus(false)
        console.log(`${JSON.stringify(res)}`)
        if(!res.loginstatus) {
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
        if(!this.tvsource) {
            this.tvsource = await lowlayer.getVideoSource()
        }
        return this.tvsource
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
            pkgList: apkPkgName // 'com.tianci.movieplatform'
        }
        console.log(param)
        let res = await lowlayer.getAppInfo(param)
        return JSON.parse(res.data)
    }
     /**
     * startAppX  酷开小程序页+启广告
     */
    async _startAppX(taskinfo) {
        console.log("_startAppX")
        let dataerParams = {
            "page_name":"广告任务",
            "activity_type":"OKR活动",
            "button_name":"广告任务",
            "parent_page_name":"活动主页面-任务列表",
            "activity_name":"2020春节活动"
        }
        let obj = JSON.parse(taskinfo);
        let countdown = obj.value.countdown;
        let taskId = obj.value.taskId;
        let taskType = obj.value.taskType;
        let taskName = obj.value.taskName;
        let videoSource = obj.value.videoSource;
        let jumpbgimgurl = obj.value.jumpbgimgurl;
        let jumpimgurl = obj.value.jumpimgurl;
        let jumpremindimgurl = obj.value.jumpremindimgurl;
        let timestampms = Date.parse(new Date());
        let timestamp = parseInt(timestampms/1000);
        let r = ccStore.getters.commonParam();
        let videoAskParams = {
            "countDownTime" : countdown,
            "verify_key" : timestamp,
            "isFinish" : false,
            "serverUrl" : urls.actUrl + "building/v2/app",
            "openId": r.cOpenId,
            "id" : r.id,
            "jumpImgUrl" : jumpimgurl,//浏览不加机会图
            "jumpBgImgUrl" : jumpbgimgurl,//浏览倒计时图
            "taskId" : taskId,
            "jumpRemindImgUrl" : jumpremindimgurl,//浏览加机会图
            "userKeyId" : r.userKeyId,
            "needExitDialog" : "true",
            "problem" : "",
            "dataerParams" : dataerParams
        };
        console.log(obj.value.remainingNumber);
        if(obj.value.remainingNumber>0){
            videoAskParams.needExitDialog = "true";
            videoAskParams.isFinish = "false";
        }else{
            videoAskParams.needExitDialog = "false";
            videoAskParams.isFinish = "true";
        }
        console.log(JSON.stringify(videoAskParams));
        let taskParamStr = {
            "videoUrl":videoSource,
            "adId":JSON.stringify({activeId:r.id,taskId:taskId})
        };
        let videoAskParamStr = JSON.stringify(videoAskParams);
        taskParamStr = JSON.stringify(taskParamStr);
        let appx_url = 'appx://com.coocaa.videoask?taskParams='+encodeURIComponent(taskParamStr) + '&isDebug=true&videoAskParams='+encodeURIComponent(videoAskParamStr) + '';
        console.log("========appx_url ============== " + appx_url+"==============");
        ccApp.startAppX({url:appx_url,type:"startService",preload:false});
        return true
    }

    /**
     * 获取登录状态
     */
    async getLoginStatus(flag=true) {
        let source = this.tvsource,
            res = await lowlayer.getLoginStatus({source})
        return flag ? res.data.loginstatus : res.data
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
        console.log("mw_tv startCommonPage:"+JSON.stringify(param))
        return lowlayer.startCommonPage(param)
    }

    /**
     * 购物商城详情页
     * @param {*} param 
     */
    startMallDetail(param) {
        console.log(param)
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
    /**
     * 启动主页专题
     * @param {*} param 
     */
    startHomeSpecial(param) {
        return lowlayer.startHomeSpecial(param)
    }

    /**
     * 获取下载apk需要的详细信息
     * @param {String} pkg 需要下载的apk包名 
     * @return {Object} o.ret 正常返回 0
     *                        已安装返回 -1
     *                        apk下载包信息获取失败 -2
     *                        空间不足返回 -3
     *                        apk下载地址获取失败 -4
     */                       
    async getDownloadPkgInfo(pkg) {
        let details = {},
            result = await ccMw.tv.getAppInfo([pkg])
        if(result[pkg].status !== '-1') {
            console.log('apk已安装')
            details.ret = -1
            return details
        }   
        console.log('apk未安装')
        //step1: 获取apk下载包信息
        result = await ccUtil.post({
            url: 'http://tc.skysrt.com/appstore/appstorev3/appDetail',
            data: {pkg}
        })
        console.log(result)
        result = JSON.parse(result)
        if(result.ret !== 0) {
            console.log('apk下载包信息获取失败: ' + JSON.stringify(result))
            details.ret = -2
            return details
        }
        details = {
            ret: 0,
            packageName: pkg,
            appId: result.data.appId,
            iconUrl: result.data.icon, 
            title: pkg,
            size: +(result.data.fileSize/1024/1024).toFixed(2),
        }
        console.log("details"+JSON.stringify(details))
        //step2: 获取硬盘剩余空间
        result = await this.getMemInfo()
        let freeSpace = result.data.freeSpace / 1024 / 1024
        console.log('磁盘剩余空间: ' + freeSpace)
        if(freeSpace < 200) {
            console.log('磁盘空间不足')
            details.ret = -3
            return details
        }

        //step3: 获取apk下载地址
        result = await ccUtil.post({
            url: 'http://tc.skysrt.com/appstore/appstorev3/download',
            data: {pkg}
        })
        result = JSON.parse(result)
        details.md5 = result.md5
        details.downloadUrl = result.downloadEx
        console.log("details2:"+JSON.stringify(details))
        return details
    }

    createDownloadTask(param) {
        return lowlayer.createDownloadTask(param)
    }
    deleteDownloadTask(param) {
        return lowlayer.deleteDownloadTask(param)
    }
    pauseDownloadTask(param) {
        return lowlayer.pauseDownloadTask(param)
    }
    resumeDownloadTask(param) {
        return lowlayer.resumeDownloadTask(param)
    }
    addDownloadChangedListener(param) {
        return lowlayer.addDownloadChangedListener(param)
    }
    removeDownloadChangedListener(param) {
        return lowlayer.removeDownloadChangedListener(param)
    }
    
    getMemInfo() {
        return lowlayer.getMemInfo()
    }

    startAppX() {
        return lowlayer.startAppX()
    }

    async judgeJump(param){
        let pkgname = param.packagename || "";
        let needversioncode = param.versioncode || "-1";
        let missionversioncode = param.missionversioncode || "-1";
        let hasversioncode = "";
        let result = await ccMw.tv.getAppInfo([pkgname]);
        if(result[pkgname]){
            if(result[pkgname].status == -1) {
                console.log("应用不存在，请前往下载");
                return { code: 1001, msg: "应用不存在，请前往下载" }
            }else{
                hasversioncode = result[pkgname].versionCode;
                console.log(pkgname+"----"+hasversioncode+"====need==="+needversioncode+"----miss----"+missionversioncode)
                if (hasversioncode < needversioncode) {
                    console.log("当前版本过低，请进行升级");
                    return { code: 1002, msg: "当前版本过低，请进行升级" };
                } else {
                    if (hasversioncode < missionversioncode) {
                        console.log("当前版本可执行跳转，但不符合建议版本要求，建议进行升级");
                        return { code: 1003, msg: "当前版本可执行跳转，但不符合建议版本要求，建议进行升级" };
                    } else {
                        console.log("当前版本符合要求，可进行后续操作");
                        return { code: 1000, msg: "当前版本符合要求，可进行后续操作" };
                    }
                }
            } 
        }else{
            console.log("查询应用信息失败");
            return{ code: 1004, msg: "查询应用信息失败" };
        }
    }

    async startNormalJump(obj){
        console.log(obj)
        console.log(ccStore.state.actionId+"=="+ccStore.state.userKeyId);
        let pkgname = obj.packagename || "";
        let bywhat = obj.bywhat || "";
        let byvalue = obj.byvalue || "";
        let params = obj.params || {};
        let jumpBgImgUrl = obj.jumpBgImgUrl || "";
        let jumpImgUrl = obj.jumpImgUrl || "";
        let jumpRemindImgUrl = obj.jumpRemindImgUrl || "";
        let countdown = obj.countdown || "";
        
        let isApkTaskJump = obj.isApkTaskJump || false;
        let taskId = obj.taskId || "";
        let activityId = obj.activityId || ccStore.state.actionId;
        let userKeyId = obj.userKeyId || ccStore.state.userKeyId;
        let adressIp = obj.adressIp || "";
        let isFinish = obj.isFinish || "false"; //字符串'true'，'false';remainingNumber剩余完成次数，大于0则为false；
        let str = [];
        let str2 = [];
        console.log("params=="+JSON.stringify(params));
        if (JSON.stringify(params) != "{}") {
            for (let key in params) {
                let px = {};
                px[key] = params[key];
                str.push(px);
                str2.push(px);
            } 
        }
        console.log(isApkTaskJump)
        if (isApkTaskJump) {
            // str = JSON.parse(str);
            var external = { "taskId": taskId, "id": activityId, "userKeyId": userKeyId, "countDownTime": countdown, "verify_key": new Date().getTime(), "subTask": "0", "isFinish": isFinish, "jumpBgImgUrl": jumpBgImgUrl, "jumpImgUrl": jumpImgUrl, "jumpRemindImgUrl": jumpRemindImgUrl, "serverUrl": adressIp + "/building/v4/app" };
            var doubleEggs_Active = { "doubleEggs_Active": external };
            str.push(doubleEggs_Active);
            // str = JSON.stringify(str);
        }
        
        let _actionOnj = {};
        if (bywhat == "activity"||bywhat == "class") {
            _actionOnj = {"type": bywhat,"className": byvalue,"params":str,"extra":str}
        }  else if (bywhat == "uri") {
            _actionOnj = {"type": bywhat,"uri": byvalue,"params":str,"extra":str}
        } else if (bywhat == "pkg") {
            _actionOnj = {"type": bywhat,"packageName": pkgname,"params":str,"extra":str}
        } else if (bywhat == "action") {
            _actionOnj = {"type": bywhat,"actionName": byvalue,"params":str,"extra":str}
        }
        console.log(JSON.stringify(_actionOnj))
        this.startCommonPage(_actionOnj);
    }
}

let inst = TVApi.getInstance()

export default inst