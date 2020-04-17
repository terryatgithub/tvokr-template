var store = {
    debug: true,
    state: {
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
    },
    getters: {
        commonParam() {
            let state = store.state;
            let r = {
                id: state.actId.divid || '',
                source: state.source, //设备信息
                MAC: state.deviceInfo.mac || '',
                cModel: state.deviceInfo.model || '',
                cChip: state.deviceInfo.chip || '',
                cUDID: state.deviceInfo.activeid || '',
                token: state.userToken, //用户信息 //todo wx
                cOpenId: state.userInfo.open_id ? state.userInfo.open_id : '', 
                cNickName: state.userInfo.nick_name ? state.userInfo.nick_name : '默认名',
                mustLogin: state.hasLogin ? true : false,
                thirdUserId: state.userInfo.thirdUserId ? state.userInfo.thirdUserId : '', //第三方openId
                vuserid: state.userInfo.vuserid ? state.userInfo.vuserid : '', //微信openId 如果有的话必须
                loginType: state.userInfo.loginType ? state.userInfo.loginType : 0,  //登录类型 0表示手机登陆，1表示QQ登陆，2表示微信登陆
                cHomepageVersion: state.homepageVersion,
                userKeyId: state.userKeyId ? state.userKeyId : ''
            };
            if(process.env.NODE_ENV === 'mock' || ccDebug.isPCMode()) {
                r.cNickName = '默认名' //转盘任务初始化
                // r.cNickName = 'yes' //已登录并瓜分成功
                // r.cNickName = 'no'  //已登录但没有瓜分资格
                // r.mustLogin = false //未登录
               state.homepageVersion = 7140038
            }
            return r
        }
    },
    setActiviyId(divid, draw) {
        if(this.debug) console.log(`ccStore set actId: ${JSON.stringify(arguments)}`)
        if(divid && draw) {
            this.state.actId = {
                divid,
                draw
            }
        } 
    },
    setSource(value) {
        if(this.debug) console.log(`ccStore set source: ${JSON.stringify(value)}`)
        this.state.source = value
    },
    setDeviceInfo(value) {
        if(this.debug) console.log(`ccStore set deviceInfo: ${JSON.stringify(value)}`)
        this.state.deviceInfo = value
    },
    setHomepageVersion(value) {
        if(this.debug) console.log(`ccStore set homepageVersion: ${JSON.stringify(value)}`)
        this.state.homepageVersion = value
    },
    setHasLogin(value) {
        if(this.debug) console.log(`ccStore set hasLogin: ${JSON.stringify(value)}`)
        this.state.hasLogin = value
    },
    setUserToken(value) {
        if(this.debug) console.log(`ccStore set userToken: ${JSON.stringify(value)}`)
        this.state.userToken = value
    },
    setUserInfo(value) {
        if(this.debug) console.log(`ccStore set userInfo: ${JSON.stringify(value)}`)
        this.state.userInfo = value
    },
    setUserKeyId(value) {
        if(this.debug) console.log(`ccStore set userKeyId: ${JSON.stringify(value)}`)
        this.state.userKeyId = value
    },
    setCcFrom(value) {
        if(this.debug) console.log(`ccStore set ccfrom: ${JSON.stringify(value)}`)
        this.state.ccfrom = value || ''
    },
    printAllState() { //debug only
        Object.entries(this.state).forEach(item => console.log(item))
    }
}

export default store