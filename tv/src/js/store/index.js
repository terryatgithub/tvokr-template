/**
 * 全局状态类
 * 参考Vuex结构，提供通用全局状态的存取
 * @todo 目前getters没有实现异步存取功能, 更多功能也需要完善
 */
import state from './state'
import mutation from './mutation'
import getters from './getters'

const store = {
    state,
    ...mutation, 
    getters
}

export default store