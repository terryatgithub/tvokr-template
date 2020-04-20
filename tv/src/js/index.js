/**
 * JS入口文件
 * 注册Native层事件回调
 */
import '../css/common.css'
import '../css/index.scss'
import ccMap from '@ccos/ccmap'
import ccMain from './main.js'

window.ccMap = ccMap

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