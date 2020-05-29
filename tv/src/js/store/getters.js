/**
 * 全局状态类-getter
 * 参考Vuex结构
 */
import state from './state'

var getters = {
    commonParam() {
        let r = {
            id: state.actionId || '',
            cUDID: state.deviceInfo.activeid || '',
            cOpenId: state.userInfo.open_id ? state.userInfo.open_id : '', 
            MAC: state.deviceInfo.mac || '',
            cModel: state.deviceInfo.model || '',
            cChip: state.deviceInfo.chip || '',
            cEmmcCID: state.deviceInfo.emmcid?state.deviceInfo.emmcid : '123456', 
            accessToken: state.userToken, //用户信息  
            source: (state.tvsource=="tencent")?"tencent":"iqiyi", //设备信息
            cHomepageVersion: state.homepageVersion,
            vuserid: state.userInfo.vuserid ? state.userInfo.vuserid : '', //微信openId 如果有的话必须
            awardOriginFlag : 0
        };
        let source = (r.source=="tencent")?"tencent":"iqiyi";
        console.log(source)
        let str = "MAC="+r.MAC+"&accessToken="+r.accessToken+"&cChip="+r.cChip+"&cEmmcCID="+r.cEmmcCID+"&cModel="+r.cModel+"&cOpenId="+r.cOpenId+"&cUDID="+r.cUDID+"&id="+r.id+"&source="+source+"&gnTzIdesKHE2QBYw";
        console.log(str);
        let token = ccUtil.sha256(str)
        r.token = token

        if(process.env.NODE_ENV === 'mock' || ccDebug.isPCMode()) {
            r.cNickName = '匿名用户' //转盘任务初始化
            state.homepageVersion = 7140038
            
        }
        return r
    }
}

export default getters