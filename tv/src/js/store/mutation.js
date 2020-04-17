/**
 * 全局状态对象-mutation
 * 参考Vuex结构
 */
var mutation = {
    debug: true,
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
        this.state.ccfrom = value || 'movie'
    },
    printAllState() { //debug only
        Object.entries(this.state).forEach(item => console.log(item))
    }
}

export default mutation