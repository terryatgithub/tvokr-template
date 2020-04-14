import '../css/common.css'
import '../css/index.scss'

// import * as jQuery from "jquery"
// import * as $ from "jquery"
import * as ccmap from '@ccos/ccmap'
// import * as ccApp from '../framework/ccsdk-1.0.js'
import * as ccApp from '@ccos/ccsdk'

// console.log(jQuery().jquery)
console.log($().jquery)

class App {
  initDebug() {
    console.log("init debug()");
    ccApp.ccDebug.setDeviceInfo({ chip: "ccc" });
  }
  initBindEvent() {
    console.log("init event()");
    ccApp.deviceReady(this.onDeviceReady);
    ccApp.bindEvent('resume', () => {
      console.log('resume');
    });
    ccApp.bindEvent('pause', () => {
      console.log('pause');
    });
    ccApp.bindEvent('backbutton', () => {
      console.log('backbuttonup');
      ccApp.exitPage();
    });
    ccApp.bindEvent("backbuttondown", () => {
      console.log('backbuttondown');
    });
    ccApp.bindEvent('homebutton', function () {
      console.log('homebutton');
    });
    ccApp.bindEvent('menubutton', function () {
      console.log('menubutton');
    });
  }
  onDeviceReady() {
    console.log('deviceReady');
    // 使用ccmap插件，初始化
    ccmap.init(".coocaa_btn", "#second", "btn-focus");
    $("#first,#second,#third").unbind("focus").bind("focus", function () {
      console.log('触发focus事件');
    });
    $("#second").unbind("itemClick").bind("itemClick", function () {
      console.log('跳转应用圈');
      ccApp.startAppStore(function () { console.log('success!!!') }, function () { console.log('error') });
    });
    $("#first").trigger("itemClick");

    new Promise((resolve) => {
      console.log('exec promise', jQuery().jquery)
      setTimeout(() => {
        resolve();
      }, 5000)
    }).then(() => {
      console.log('exec then');
    })

    //获取设备信息
    ccApp.getDeviceInfo(
      (msg) => console.log(JSON.stringify(msg)),
      (err) => console.log(err)
    )
  }
}


let app = new App()

app.initDebug();
app.initBindEvent();