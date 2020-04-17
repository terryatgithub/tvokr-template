/**
 * 全局状态对象-state
 * 参考Vuex结构
 */
const state = {
    //项目信息        
    actId: { //活动id，对于418会员日，有2个活动id 
        divid: 218,
        draw: 217
    }, 
    actPeriod: {
        start: '2020-4-09 00:00:00',
        end: '2020-4-20 00:00:00'
    },
    actStates: 'ongoing', //'end'
    source: 'yinhe',
    deviceInfo: {},
    userInfo: {},
    userToken: '',
    hasLogin: false,
    luckDrawInfo: { //抽奖任务相关
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
    seckillGoodsInfo: {}, //秒杀商品活动id，调用秒杀后台接口需要
    goVipBuyPage: false,
    goLoginPage: false,
    homepageVersion: 0,
    userKeyId: '',
    ccfrom: 'movie',//进入活动的来源, 默认影视，可在url后配置：ccfrom=edu/kid/game
}

export default state