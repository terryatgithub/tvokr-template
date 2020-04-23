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
    actStates: 'ongoing', //活动状态：进行中 或 已结束 'end'
    source: 'yinhe', //视频源
    deviceInfo: {}, //设备信息
    userInfo: {},   //用户信息
    userToken: '',  //
    hasLogin: false,    //用户是否已登录
    goVipBuyPage: false,   //去产品包购买页
    goLoginPage: false, //去登录页
    homepageVersion: 0, //主页版本号
    userKeyId: '',  //后台返回的标识用户唯一身份的字段
    ccfrom: 'movie',//进入活动的来源, 默认影视，可在url后配置：ccfrom=edu/kid/game
    luckDrawInfo: { //抽奖后台返回的用戶VIP信息
        isVip: false,
        vipType: 0,
        overNum: 0,
        vipSourceId: {
            'movieiyiqi': 1, //影视奇异
            'movietencent': 5, //影视腾讯
            'edu': 58, //教育
            'kid': 57, //少儿
            'game': 56 //电竞
        }
    },
}

export default state