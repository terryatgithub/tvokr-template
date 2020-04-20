/**
 * 页面路由类
 * 用hashchange实现
 */
import routes from './config.js'

class ccRouter {
    constructor(param) {
        this.routes = param.routes
        this._from = 'home'
    }

    /**
     * 路由初始化
     */
    init() {
        $(window)
            .off('hashchange')
            .on('hashchange', this.onHashChange.bind(this))
    }

    /**
     * 切换页面
     * @param {String} path 需要切换到的页面名称
     */
    push(path) {
        this._from = this._parseHash().h
        window.location.href = window.location.href.split('#')[0] + `#${path}` 
    }

    /**
     * 路由回调函数
     * @param {Event} e 路由Event对象
     */
    onHashChange(e){
        console.log(`hash changed: ${location.hash}`)
        let from = this.routes[this._getRouteIndex(this._from)],
            path = this._parseHash(),
            to = this.routes[this._getRouteIndex(path.h)];
        from.view.uninit()  //todo 是否需要改爲async/await
        to.view.init(path.param)    
        this._from = to.name    
    }
    
    /**
     * 解析url中的hash及hash后带的参数
     * @return {Object} h: hash name, 比如'home' 'rule' 
     *                  param: hash后带的参数，比如跳转到home页指定位置
     */
    _parseHash() {
        let s = location.href.split('#')[1],
            h = s || 'home', 
            param = null;
        if(s && s.indexOf('?') !== -1) {
            s = s.split('?')
            h = s[0]
            param = s[1]
        }
        let res = {
            h,
            param
        }
        return res
    }

    /**
     * 获取对应的路由索引
     * @param {String} name 路由地址,比如 'home' 'rule' 
     */
    _getRouteIndex(name) {
        return this.routes.findIndex((item) => {
            return item.name === name
        })
    }

    /**
     * 浏览器是否支持hashchange事件
     * 目前TV端测试都是支持的
     */
    isHashSupported() {
        return ("onhashchange" in window)
    }
}

const router = new ccRouter({routes})
export default router

