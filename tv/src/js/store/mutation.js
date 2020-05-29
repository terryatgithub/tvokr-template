/**
 * 全局状态对象-mutation
 * 参考Vuex结构
 */
var mutation = {
    debug: true,
    setDeviceInfo(value) {
        if(this.debug) console.log(`ccStore set deviceInfo: ${JSON.stringify(value)}`)
        this.state.deviceInfo = value
    },
    setUserInfo(value) {
        if(this.debug) console.log(`ccStore set userInfo: ${JSON.stringify(value)}`)
        this.state.userInfo = value
    },
    setGlobalVar(key,value,defaultValue) {
        if(this.debug) console.log('ccStore set '+key+':'+JSON.stringify(value))
        this.state[key] = value || defaultValue
    },
    printAllState() { //debug only
        Object.entries(this.state).forEach(item => console.log(item))
    }
}

export default mutation