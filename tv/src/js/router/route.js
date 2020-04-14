import homePage from '../views/home.js'
import awardPage from '../views/award.js'
import seckillPage from '../views/seckill.js'
import rulesPage from '../views/rules.js'

class ccRouter {
    constructor(param) {
        this.routes = param.routes
        this._from = 'home'
    }
    isHashSupported() {
        return ("onhashchange" in window)
    }
    _getHash() {
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
    _changeHash(name) {
        window.location.href = window.location.href.split('#')[0] + `#${name}`   
    }
    push(path) {
        this._from = this._getHash().h
        path = path.split('?')
        let to = this.routes[this._findRoute(path[0])]
        this._changeHash(to.name + `${path[1] ? ('?'+path[1]) : '' }`)
    }
    onHashChange(e){
        console.log(`hash changed: ${location.hash}`)
        let from = this.routes[this._findRoute(this._from)]
        from.component.uninit()

        let path = this._getHash()
        let to = path.h
        to = this.routes[this._findRoute(to)]
        to.component.init(path.param)
        this._from = to.name
    }
    _findRoute(name) {
        return this.routes.findIndex((item) => {
            return item.name === name
        })
    }
}

const routes = [
    {
        name: 'home',
        // path: '/home',
        component: homePage
    },
    {
        name: 'award',
        // path: '/award',
        component: awardPage
    },
    {
        name: 'seckill',
        // path: '/seckill',
        component: seckillPage
    },
    {
        name: 'rules',
        component: rulesPage
    }
]

const router = new ccRouter({
    routes
})

export default router

