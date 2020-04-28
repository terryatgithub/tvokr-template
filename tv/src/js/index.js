/**
 * JS入口文件
 * 注册Native层事件回调
 */
import '../css/common.css'
import '../css/index.scss'
import ccMain from './main.js'

import homeHtml from './views/home/home.html'
import awardHtml from './views/award/award.html'
import rulesHtml from './views/rules/rules.html'
import seckillHtml from './views/seckill/seckill.html'
import toastHtml from './component/toast/toast.html'
import dialogHtml from './component/dialog/dialog.html'

function generateHtml() {
    const content = [
        '<div id="deviceready">',
        homeHtml,
        awardHtml,
        rulesHtml,
        seckillHtml,
        toastHtml,
        dialogHtml,
        '</div>'
    ]
    document.write(content.join(''))
}

class App {
    constructor() {
    }

    static getInst() {
        if(!this.inst) {
            this.inst = new App()
        }
        return this.inst
    }

    initialize() {
        console.log("page start initialize...")
        // ccApp.ccDebug.setDeviceInfo({ chip: "bbb" })
        generateHtml()
        this.bindEvents()
    }

    bindEvents() {
        console.log("bindEvents")
        ccApp.deviceReady({ //obsolete, use 'ccReady' instead.
            // onReceive: app.onDeviceReady,
            // success: function() {
            //     console.log('deviceReady success')
            // }
        });
        ccApp.ccReady({
            onReceive: ccMain.onCcReady.bind(ccMain),
            success: function() {
                console.log('ccReady success')
            }
        });
        ccApp.bindEvent({
            eventName: 'resume',
            onReceive: function () {
                console.log('resume')
                ccMain.onResumeEvent().bind(ccMain)
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
                ccMain.backKeyHandler().bind(ccMain)
            },
            success: function() {
                console.log('backbuttondown bind success')
            }
        });
        ccApp.bindEvent({
            eventName: 'homebutton',
            onReceive: function () {
                console.log('homebutton')
                ccMain.homeKeyHandler().bind(ccMain)
                ccApp.exitPage();
            }
        });
    }

}

App.getInst().initialize()