/**
 * Web页面初始化模块
 * 完成全局变量注册、以及初始化相关的逻辑处理
 */
import _router from './router/index.js'
import _store from './store/index.js'
import _mw from './middleware/index.js'
import _util from './util/index.js'
import _data from './util/datacollect.js'
import pcDebug from './debug/debug.js'

import _dialog from './component/dialog/dialog.js' 
import _qrcode from './component/dialog/qrcode.js'
import _toast from './component/toast/toast.js'

import homePage from './views/home/home.js'
import awardPage from './views/award/award.js'
import seckillPage from './views/seckill/seckill.js'
import rulesPage from './views/rules/rules.js'

//全局对象
window.ccRouter = _router
window.ccStore = _store
window.ccMw = _mw
window.ccUtil = _util
window.ccData = _data
//全局组件
window.ccToast = _toast
window.ccDialog = _dialog //todo 所有弹窗是否归为一个对象
// window.ccQrCode = _qrcode

/**
 * Web页面初始化类
 */
class Main {
    constructor() {
        //todo
    }

    /**
     * ccReady事件回调函数
     */
    onCcReady() {
        console.log('ccReady')
        this._setDebugger()
        this._init()
        this._listenStateChange()
    }

    _setDebugger() {
        //权清
        ccDebug.setUserInfo({open_id: 'b0ef6e9182c411e9b3f874a4b5004af8'})
        ccDebug.setAccessToken({accesstoken: "2.1a13b57706d5432582979fb92e8e81f9"})
        //王盼
        // ccDebug.setUserInfo({open_id: '038a62ba2e4311e8987500505687790a'})
        // ccDebug.setAccessToken({accesstoken: "2.e8ba7f6180344d0c8b66b49dd0441890"})
        //陈念念
        // ccDebug.setUserInfo({open_id: 'f2fe88d7446711e9a09700505687790a'})
        // ccDebug.setAccessToken({accesstoken: "2.8488672bab6e437381c47379ca1fee9b"})
    }

    /**
     * 页面初始化
     */
    async _init() {
        try { 
            console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`)
            ccRouter.init()
            this._setActId()
            await ccMw.tv.init()
            await homePage.init()
            if(ccUtil.isDevMode() || ccUtil.isMockMode()) {
                pcDebug.init(this)
                ccUtil.listenUnhandleRejection()
            }
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 注册后台事件的监听回调函数
     * 比如用户登录状态等
     */
    _listenStateChange() {
        ccMw.tv.addLoginChangedListener(async res => {
            console.log(`用户登录状态发生变化, data: ${JSON.stringify(res)}`)
            if(!res.userchangged) { return }
            await this._callbackInitOnResume({bInit:true})
        })  
    }
    /**
     * 返回键回调函数
     */
    async backKeyHandler(){
        let dlgShow = ccDialog.isShow()
        switch(true) {
            case homePage.isShow():
                if(dlgShow) {
                    dlgShow.hide()
                    homePage.bindKeys()
                } else {
                    ccData.submitLogClick({
                        page_name: '活动主页面',
                        activity_stage: ccData.activity_stage,
                        button_name: '返回键'
                    }) 
                    if(ccStore.state.actStates !== 'end') {
                        await ccUtil.sleep(800) //bugfix 主页返回键delay800，fix从二级页面连续快速按返回键焦点问题
                        this.showDialogAskUserStay()
                    } else {
                            ccData.submitLogResult({
                                page_name: '活动主页面',
                                stay_duration: (ccUtil.getNowTimeSecond() - ccData.timePageStart)/1000
                            }) 
                        ccApp.exitPage();
                    }
                }
                break;
            case awardPage.isShow(): 
                if(dlgShow) {
                    dlgShow.hide()
                    awardPage.bindKeys()
                } else {
                    ccRouter.push('home')
                }
                break;
            case rulesPage.isShow(): 
                if(dlgShow) {
                    dlgShow.hide()
                    rulesPage.bindKeys()
                } else {
                    ccRouter.push('home')
                }
                break;
            case seckillPage.isShow(): 
                if(dlgShow) {
                    dlgShow.hide()
                    seckillPage.bindKeys()
                } else {
                    ccRouter.push('home')
                }
                break;
        }
    }

    /**
     * Home键回调函数
     */
    homeKeyHandler() {
        let page_name = '活动主页面'
        switch(true) {
            case homePage.isShow():
                page_name = '活动主页面'
                break;
            case awardPage.isShow(): 
                page_name = '我的奖品'
                break;
            case rulesPage.isShow(): 
                page_name = '活动规则'
                break;
            case seckillPage.isShow(): 
                page_name = '我的秒杀'
                break;
        }
        ccData.submitLogClick({
            page_name: '活动主页面',
            button_name: '主页键',
            button_state: '',
            task_type: ''
        }) 
        ccData.submitLogResult({
            page_name: '活动主页面',
            stay_duration: (ccUtil.getNowTimeSecond() - ccData.timePageStart)/1000
        }) 
    }

    /**
     * 从url参数读取活动id(如果有值的话)
     */
    _setActId() {
        console.log("-----------------_setActId--------------------");
        ccStore.setGlobalVar("ccfrom",ccUtil.getUrlParam('ccfrom'), '');
        ccStore.setGlobalVar("actionId",ccUtil.getUrlParam('id'),ccStore.state.actionId);
        ccStore.setGlobalVar("miaoshaId",ccUtil.getUrlParam('id2'),ccStore.state.miaoshaId);
        console.log('活动id:' + ccStore.state.actionId) 
        console.log('秒杀活动id:' + ccStore.state.miaoshaId) 
    }

    /**
     * 页面resume事件的回调函数
     */
    async _callbackInitOnResume(param){
        await ccMw.tv.init(false)
        await homePage.init(param)
    }
    /**
     * 主页挽留弹窗
     */
    async showDialogAskUserStay() {
        ccData.submitLogShow({
            page_name: '退出活动挽留弹窗',
            page_type: 'inactivityWindows',
            coocaabi_state:''
        })
        let innerHtml = `<div class="dialogTitle">看电视赚现金,福利领不停！</div><div id="persuadeInfo">确定要退出活动吗？</div><img id="persuadeImg" src="${require('../images/dialog/iconleave.png')}"/>`
        let ret = await ccDialog.show({
            innerHtml:innerHtml,
            btnOK: '下次再来',
            btnCancel: '继续参与',
            defFocus: 'cancel'
        }) 
        if(ret.confirm) {
            console.log('ok')
            ccData.submitLogClick({
                page_name: '退出活动挽留弹窗',
                button_name: '下次再来',
                coocaabi_state: ''
            })
            ccData.submitLogResult({
                page_name: '活动主页面',
                stay_duration: (ccUtil.getNowTimeSecond() - ccData.timePageStart)/1000
            }) 
            ccApp.exitPage();
        } else {
            console.log('cancel')
            ccData.submitLogClick({
                page_name: '退出活动挽留弹窗',
                button_name: '继续参与',
                coocaabi_state: ''
            })
            homePage.bindKeys()
        }
    }

    /**
     * resume事件的回调函数
     */
    async onResumeEvent() {
        console.log('onResumeEvent')
        if(ccStore.state.goLoginPage) { //登录状态
            ccStore.setGlobalVar("goLoginPage",false,false);
            ccData.submitLogResultLogin({
                page_name: '418会员日活动电视端登录弹窗',
                page_type: 'inactivityWindows',
                login_result: ccStore.state.loginstatus ? '登录成功' : '登录失败'
            })
        }
        
        //if (kubiPage.isShow()||rulesPage.isShow()||ccStore.state.loginstatus=="true") {
        //    console.log("不需要刷新")
        //}else{
        //    await this._callbackInitOnResume({bInit:false})
        //}
    }
}

const main = new Main()
export default main