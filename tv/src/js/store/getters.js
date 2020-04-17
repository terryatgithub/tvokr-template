/**
 * 全局状态类-getter
 * 参考Vuex结构
 */
import state from './state'

var getters = {
    commonParam() {
        let r = {
            id: state.actId.divid || '',
            source: state.source, //设备信息
            MAC: state.deviceInfo.mac || '',
            cModel: state.deviceInfo.model || '',
            cChip: state.deviceInfo.chip || '',
            cUDID: state.deviceInfo.activeid || '',
            token: state.userToken, //用户信息  
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
}

export default getters