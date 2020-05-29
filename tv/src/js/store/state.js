/**
 * 全局状态对象-state
 * 存放可能需要全局访问的变量
 * 参考Vuex结构
 */
const state = {
    actId: { //活动id，对于418会员日，有2个活动id 
        divid: 218,
        draw: 217
    }, 
    ccfrom: '', //运营配置页面入口字段
    actionId:"0", 
    miaoshaId:"0",//秒杀活动id
    actStates:"end",//活动进行中
    tvsource: 'yinhe', //视频源
    deviceInfo: {}, //设备信息
    userInfo: {},   //用户信息
    loginstatus : false,
    goLoginPage: false,
    access_token: '',  //
    vuserid : '',
    homepageVersion: 0, //主页版本号
    browserVersion: 0,//浏览器版本
    activityCenterVersion:0,//活动中心版本
    mallVersion: 0,//商城版本
    userKeyId: '',  //后台返回的标识用户唯一身份的字段
    startDayNum :'0',//活动当前第几天
    GetvxPluginT:"",
    timerId : 0,
    autoClickAfterLogin : false,
    vipSourceId: {
        'movieiyiqi': 1, //影视奇异
        'movietencent': 5, //影视腾讯
        'edu': 58, //教育
        'kid': 57, //少儿
        'game': 56 //电竞
    },
    gamesGoodsArr : [13906,10136,14170,14169,14163,11180,10104,14155],  ////正式：[22887,22889,22892,22784,23625,23624,23452,23451,23565];
    hasDownTask : false,//是否有进行中的下载任务
    downIndex : -1,
    spikeSign : 0,//秒杀的sign
    loginTaskId: 0,//登录任务id
    remainLoginTaskNum : 0//剩余的登录任务完成次数
}

export default state