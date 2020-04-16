import '../css/common.css'
import '../css/index.scss'
import ccMap from '@ccos/ccmap'
import router from './router/route.js'
import store from './store/store.js'
import api from './api/api.js'
import pcDebug from './debug/debug.js'
import _util from './util/index.js'
import _data from './util/datacollect.js'
import _dialog from './component/dialog.js'
import _qrcode from './component/qrcode.js'
import _coupon from './component/coupon.js'
import _entityCollected from './component/entitycollected.js'
import _toast from './component/toast.js'
import homePage from './views/home.js'
import awardPage from './views/award.js'
import seckillPage from './views/seckill.js'
import rulesPage from './views/rules.js'
import util from './util/index.js'

window.ccMap = ccMap
window.ccStore = store
window.ccApi = api
window.ccUtil = _util
window.ccData = _data
window.ccDialog = _dialog
window.ccQrCode = _qrcode
window.ccCoupon = _coupon
window.ccEntityCollected = _entityCollected
window.ccToast = _toast

var ccMain = {
    _setActId() { //从url参数读取活动id
        ccStore.setActiviyId(ccUtil.getUrlParam('gfid'), ccUtil.getUrlParam('cjid'))
        console.log('活动id:' + JSON.stringify(ccStore.state.actId)) 
    },
    async init() {
        try { 
            console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`)
            $(window).off('hashchange').on('hashchange', router.onHashChange.bind(router)) //放到router init里
            this._setActId()
            await ccApi.tv.init()
            await homePage.init()
            if(ccUtil.isDevMode() || ccUtil.isMockMode()) { //
                pcDebug.init(this)
                ccUtil.listenUnhandleRejection()
            }
        } catch (e) {
            console.error(e)
        }
    },
    async callbackInitOnResume(){
        // ccToast.show('提示<br>页面刷新中，请稍候~', 10000)  
        await ccApi.tv.init(false)
        await homePage.init()
        // ccToast.hide()
    },
    listenStateChange() {
        ccApi.tv.addLoginChangedListener(async res => {
            console.log(`addLoginChangedListener cb: ${JSON.stringify(res)}`)
            if(!res.userchangged) { return }
            await this.callbackInitOnResume()
        })  
    },
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
    },
    showDialogAskUserStay() { //主页挽留弹窗
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
                homePage.rebindKeys()
            }
        })
    },
    backKeyHandler: async function(){
            let dlgShow = ccDialog.isShow()
            switch(true) {
                case homePage.isShow():
                    if(dlgShow) {
                        dlgShow.hide()
                        homePage.rebindKeys()
                    } else {
                        ccData.submitLogClick({
                            page_name: '活动主页面',
                            activity_stage: ccData.activity_stage,
                            button_name: '返回键'
                        }) 
                        if(ccStore.state.actStates !== 'end') {
                            await util.sleep(800) //bugfix 主页返回键delay800，fix从二级页面连续快速按返回键焦点问题
                            this.showDialogAskUserStay()
                        } else {
                            ccApp.exitPage();
                        }
                    }
                    break;
                case awardPage.isShow(): 
                    if(dlgShow) {
                        dlgShow.hide()
                        awardPage.rebindKeys()
                    } else {
                        router.push('home')
                    }
                    break;
                case rulesPage.isShow(): 
                    if(dlgShow) {
                        dlgShow.hide()
                        rulesPage.rebindKeys()
                    } else {
                        router.push('home')
                    }
                    break;
                case seckillPage.isShow(): 
                    if(dlgShow) {
                        dlgShow.hide()
                        seckillPage.rebindKeys()
                    } else {
                        router.push('home')
                    }
                    break;
            }
    },
    async onResumeEvent() {
        console.log('onResumeEvent')
        if(ccStore.state.seckillGoodsInfo.start) {
            ccStore.state.seckillGoodsInfo.start = false
            let res = await ccApi.backend.shopping.getSeckillState()
            console.log('获取秒杀状态: ' + res)
            res = JSON.parse(res)
            if(res.returnCode === '200' || res.returnCode === '300001') {
                return //没有参与过，可继续参与
            } else if(res.returnCode === '200093') { //秒杀参与成功
                ccData.submitLogShow({
                    page_name: '秒杀状态弹窗-秒杀成功',
                    page_type: 'inactivityWindows'
                })
                res = await ccDialog.show({
                    title: '恭喜成功参与秒杀活动',
                    icon: require('../images/dialog/iconok.png'),
                    tip: '*奖品已放入【我的秒杀】，按【返回】键关闭弹窗提示!',
                    btnOK: '知道了',
                    onOK: function() { 
                        console.log('ok') 
                        ccData.submitLogClick({
                            page_name: '秒杀状态弹窗-秒杀成功',
                            page_type: 'inactivityWindows',
                            button_name: '知道了-秒杀成功',
                        })
                    },
                    onCancel: function() {
                        console.log('cancel')
                    },
                    onComplete: function() { 
                        console.log('complete')
                        homePage.rebindKeys()
                    }
                })
            } else { //参与失败
                ccData.submitLogShow({
                    page_name: '秒杀状态弹窗-秒杀失败',
                    page_type: 'inactivityWindows'
                })
                res = await ccDialog.show({
                    title: '抱歉，秒杀失败，只差一点点了~',
                    icon: require('../images/dialog/iconfail.png'),
                    tip: ' ',
                    btnOK: '知道了',
                    onOK: function() { 
                        console.log('ok') 
                        ccData.submitLogClick({
                            page_name: '秒杀状态弹窗-秒杀失败',
                            page_type: 'inactivityWindows',
                            button_name: '知道了-秒杀失败',
                        })
                    },
                    onCancel: function() {
                        console.log('cancel')
                    },
                    onComplete: function() { 
                        console.log('complete')
                        homePage.rebindKeys()
                    }
                }) 
           }
        } else if(ccStore.state.goVipBuyPage) {
            ccStore.state.goVipBuyPage = false
            await this.callbackInitOnResume()
        }

        if(ccStore.state.goLoginPage) {
            ccStore.state.goLoginPage = false
            ccData.submitLogResultLogin({
                page_name: '418会员日活动电视端登录弹窗',
                page_type: 'inactivityWindows',
                login_result: ccStore.state.hasLogin ? '登录成功' : '登录失败'
            }) 
        }
    }
}

var app = {
    initialize: function () {
        console.log("page start initialize...")
        // ccApp.ccDebug.setDeviceInfo({ chip: "bbb" })
        this.bindEvents()
    },
    bindEvents: function () {
        console.log("bindEvents")
        ccApp.deviceReady({
            onReceive: app.onDeviceReady,
            success: function() {
                console.log('deviceReady success')
            }
        });
        ccApp.ccReady({
            onReceive: app.onCcReady,
            success: function() {
                console.log('ccReady success')
            }
        });
        ccApp.bindEvent({
            eventName: 'resume',
            onReceive: function () {
                console.log('resume')
                ccMain.onResumeEvent()
            }
        });
        ccApp.bindEvent({
            eventName: 'pause',
            onReceive: function () {
                console.log('pause')
            }
        });
        ccApp.bindEvent({
            eventName: 'backbutton',
            onReceive: function () {
                console.log('backbuttonup')
                // ccApp.exitPage();
            }
        });
        ccApp.bindEvent({
            eventName: 'backbuttondown',
            onReceive: function () {
                console.log('backbuttondown ...........')
                ccMain.backKeyHandler()
            },
            success: function() {
                console.log('backbuttondown bind success')
            }
        });
        ccApp.bindEvent({
            eventName: 'homebutton',
            onReceive: function () {
                console.log('homebutton')
                ccMain.homeKeyHandler()
                ccApp.exitPage();
            }
        });
    },
    onCcReady: function () {
        console.log('ccReady')
        ccMain.init()
        ccMain.listenStateChange()
        // ccMap.init(".coocaa_btn", "#second", "btn-focus")
        // $("#first,#second,#third").unbind("focus").bind("focus", function () {
        //     console.log('触发focus事件')
        // })
        // $("#first").unbind("itemClick").bind("itemClick", function () {
        //     console.log('the first button is clicked')
        //     //获取设备信息
        //     ccApp.getDeviceInfo({
        //         success: (res) => console.log(JSON.stringify(res)),
        //         fail: (err) => console.log(err),
        //         complete: () => console.log('getDeviceInfo complete')
        //     })
        // })
        // $("#second").unbind("itemClick").bind("itemClick", function () {
        //     console.log('the second button is clicked')
        //     ccApp.startTVSetting({
        //         success: res => {
        //             console.log(JSON.stringify(res))
        //         }
        //     })
        // })
        // $("#third").unbind("itemClick").bind("itemClick", function () {
        //     console.log('the third button is clicked')
        //     //获取用户信息
        //     ccApp.getUserInfo({
        //         success: (msg) => console.log(JSON.stringify(msg)),
        //         fail: (err) => console.log(err)
        //     })
        // });
        // new Promise((resolve) => {
        //     console.log('exec promise');
        //     setTimeout(() => {
        //         resolve();
        //     }, 5000)
        // }).then(() => {
        //     console.log('exec then');
        // })

        // //获取登录状态
        // ccApp.getLoginStatus({
        //     success: (res) => console.log(JSON.stringify(res)),
        //     fail: (err) => console.log(err)
        // })

        // //获取AccessToken
        // ccApp.getUserAccessToken({
        //     success: (res) => console.log(JSON.stringify(res)),
        //     fail: (err) => console.log(err)
        // })
    }
}

app.initialize()
