/**
 * 活动首页
 * 处理跟页面交互相关的逻辑
 */
import ccView from './view.js'
import '../../css/home.scss'

class HomePage extends ccView{
    
    constructor(selector) {
        super(selector)
        this.name = 'home page'
        this.data = {
        }
    }
    
    /**
     * 生命周期函数 created 
     * 首次进入页面调用
     * @param {String} hash 
     */
	async created(hash) {
        console.log('home created')
        $(this.id).show()
        this.bindKeys()
    }
    
    /**
     *  todo 后续优化考虑添加 mounted() 
     *  created()里先加载html  
     *  mounted里放请求逻辑，以加快首屏显示
     */
    mounted() {
        console.log('home mounted')
    }

    /**
     * 生命周期函数 destroyed 
     * 退出页面时调用
     */
	destroyed() {
        console.log('home destroyed')
		$(this.id).hide()
    }

    /**
     * 点击事件回调函数
     * @param {Event} e 
     */
    async onClick(e) {
        let ctx = e.data.ctx, //ctx是注册回调函数的页面对象，比如homePage对象
            id = $(this).attr('id'),
            ret;
        console.log(`home onClick event target: ${id}`)
        switch(id){
            case 'goAwardPage': //去‘我的奖品’
                if(!ccStore.state.hasLogin) {
                    ccMw.tv.goLogin()
                    return 
                }
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '我的奖品'
                })
                ccRouter.push('award')
                break; 
            case 'goCheckRule': //去‘查看规则’
                ccRouter.push('rules')
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '活动规则'
                })
                break;     
            case 'goSeckillPage': //去‘我的秒杀’
                if(!ccStore.state.hasLogin) {
                    ccMw.tv.goLogin()
                    return 
                }
                ccRouter.push('seckill')
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '我的秒杀'
                })
                break; 
            case 'oneToastId': 
                ret = await ccDialog.show({
                    title: '一个弹窗',
                    icon: require('../../images/dialog/iconleave.png'),
                    btnOK: '确认',
                    btnCancel: '取消',
                    onOK: function() {
                        console.log('ok') 
                    },
                    onCancel: function() {
                        console.log('cancel')
                    }
                })
                if(ret.confirm) {
                    alert('ok')
                } else {
                    alert('cancel')
                }
                homePage.bindKeys()
                break;
            case 'multiToastId': 
                ret = await ccDialog.show({
                    title: '第一个弹窗',
                    icon: require('../../images/dialog/iconleave.png'),
                    btnOK: '确认',
                    btnCancel: '取消',
                    onOK: function() {
                        console.log('ok') 
                    },
                    onCancel: function() {
                        console.log('cancel')
                    }
                })
                ret = await ccDialog.show({
                    title: '第2个弹窗',
                    icon: require('../../images/dialog/iconleave.png'),
                    btnOK: '确认',
                    btnCancel: '取消',
                    onOK: function() {
                        console.log('ok') 
                    },
                    onCancel: function() {
                        console.log('cancel')
                    }
                })
                await ccDialog.show({
                    title: '第3个弹窗',
                    icon: require('../../images/dialog/iconleave.png'),
                    btnOK: '确认',
                    btnCancel: '取消',
                    onOK: function() {
                        console.log('ok') 
                    },
                    onCancel: function() {
                        console.log('cancel')
                    }
                })
                if(ret.confirm) {
                    alert('ok')
                } else {
                    alert('cancel')
                }
                homePage.bindKeys()
                break;
            default: //如果被点击元素没有id
                {
                    return
                }
        }
    }

    /**
     * onFocus
     * @param {Event} e 
     */
    async onFocus(e) {
        let ctx = e.data.ctx;
        ctx.curFocus = $(this).index(ctx.coocaaBtns)
    }

}

const homePage = new HomePage('#homePage')
export default homePage