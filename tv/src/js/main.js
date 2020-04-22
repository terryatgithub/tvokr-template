/**
 * Web页面初始化模块
 * 完成全局变量注册、以及初始化相关的逻辑处理
 */
import ccMap from '@ccos/ccmap'
import _router from './router/index.js'
import _store from './store/index.js'
import _mw from './middleware/index.js'
import pcDebug from './debug/debug.js'
import _util from './util/index.js'
import _data from './util/datacollect.js'
import _dialog from './component/dialog.js' //todo 所有弹窗是否归为一个对象
import _qrcode from './component/qrcode.js'
import _kami from './component/kami.js'
import _entityCollected from './component/entitycollected.js'
import _toast from './component/toast.js'
import homePage from './views/home.js'
import awardPage from './views/award.js'
import seckillPage from './views/seckill.js'
import rulesPage from './views/rules.js'

window.ccMap = ccMap
window.ccRouter = _router
window.ccStore = _store
window.ccMw = _mw
window.ccUtil = _util
window.ccData = _data
window.ccDialog = _dialog
window.ccQrCode = _qrcode
window.ccKami = _kami
window.ccEntityCollected = _entityCollected
window.ccToast = _toast

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
        this._init()
        this._listenStateChange()
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
            await this._callbackInitOnResume()
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
            page_name,
            activity_stage: ccData.activity_stage,
            button_name: '主页键'
        }) 
        ccData.submitLogResult({
            page_name: '活动主页面',
            stay_duration: ccUtil.getNowTimeSecond() - ccData.timePageStart
        }) 
    }

    /**
     * 从url参数读取活动id(如果有值的话)
     */
    _setActId() {
        ccStore.setCcFrom(ccUtil.getUrlParam('ccfrom'))
        ccStore.setActiviyId(ccUtil.getUrlParam('gfid'), ccUtil.getUrlParam('cjid'))
        console.log('活动id:' + JSON.stringify(ccStore.state.actId)) 
    }

    /**
     * 页面resume事件的回调函数
     */
    async _callbackInitOnResume(){
        // ccToast.show('提示<br>页面刷新中，请稍候~', 10000)  
        await ccMw.tv.init(false)
        await homePage.init()
        // ccToast.hide()
    }

    /**
     * 主页挽留弹窗
     */
    showDialogAskUserStay() {
        ccData.submitLogShow({
            page_name: '退出活动挽留弹窗',
            page_type: 'inactivityWindows'
        })
        ccDialog.show({
            title: '会员享好礼，限时秒杀天天有哦!<br>确定要退出吗?',
            icon: require('../images/dialog/iconleave.png'),
            btnOK: '狠心离开',
            btnCancel: '手抖了',
            defFocus: 'cancel',
            onOK: function() {
                console.log('ok') 
                ccData.submitLogResult({
                    page_name: '活动主页面',
                    stay_duration: ccUtil.getNowTimeSecond() - ccData.timePageStart
                }) 
                ccApp.exitPage();
            },
            onCancel: function() {
                console.log('cancel')
                homePage.bindKeys()
            }
        })
    }

    /**
     * resume事件的回调函数
     */
    async onResumeEvent() {
        console.log('onResumeEvent')

        if(ccStore.state.seckillGoodsInfo.start) { //秒杀参与情况查询
            ccStore.state.seckillGoodsInfo.start = false
            ccMw.seckill.getUserParticipationState(homePage)
        } else if(ccStore.state.goVipBuyPage) { //从产品包页面返回后刷新页面
            ccStore.state.goVipBuyPage = false
            await this._callbackInitOnResume()
        }

        if(ccStore.state.goLoginPage) { //登录状态
            ccStore.state.goLoginPage = false
            ccData.submitLogResultLogin({
                page_name: '418会员日活动电视端登录弹窗',
                page_type: 'inactivityWindows',
                login_result: ccStore.state.hasLogin ? '登录成功' : '登录失败'
            }) 
        }
    }

}

const main = new Main()
export default main