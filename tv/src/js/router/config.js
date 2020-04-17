/**
 * 路由配置对象
 *     name: 传到ccRouter.push()的地址参数
 *     view: 实际对应的页面对象
 */

import homePage from '../views/home.js'
import awardPage from '../views/award.js'
import seckillPage from '../views/seckill.js'
import rulePage from '../views/rules.js'

const routes = [
    {
        name: 'home', 
        // path: '/home',
        view: homePage
    },
    {
        name: 'award',
        // path: '/award',
        view: awardPage
    },
    {
        name: 'seckill',
        // path: '/seckill',
        view: seckillPage
    },
    {
        name: 'rules',
        view: rulePage
    }
]
 
export default routes

