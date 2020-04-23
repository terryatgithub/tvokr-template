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
                await ctx._showOneDialog()
                break;
            case 'multiToastId': 
                await ctx._showMultiDialog()                
                break;
            case 'qrId': 
                await ctx._showQrDialog()
                break;
            case 'entityId': 
                await ctx._showEntityDialog()
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

    /**
     * demo 显示一个弹窗
     */
    async _showOneDialog() {
        let ret = await ccDialog.show({
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
        this.bindKeys()
    }

    /**
     * demo 显示多个弹窗
     */
    async _showMultiDialog() {
        let ret = await ccDialog.show({
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
        this.bindKeys()
    }

    /**
     * demo 显示二维码弹窗
     */
    async _showQrDialog() {
        let qrUrl =await ccUtil.showQrCode({ url: 'http://www.coocaa.com', urlOnly: true })
        let ret = await ccQrCode.show({
            title: '恭喜获得5元巨款',
            icon: qrUrl,
            tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
            btnOK: '知道了',
            onOK: function() { 
                console.log('ok') 
            },
            onCancel: function() {
                console.log('cancel')
            },
            onComplete: function() { 
                console.log('complete')
            }
        })
        this.bindKeys()    
    }

    /**
     * demo 显示实体二维码弹窗
     */
    async _showEntityDialog() {
        let detail = `收货人: 張三<br>手机: 13555555555<br>收货地址: 北京市前門佛阿吉爾菲娜拉爾囧附件二及分類`;
        let ret = await ccEntityCollected.show({
            title: '恭喜获得实物奖',
            icon: 'http://res.lottery.coocaatv.com//uploads/img/20200403/20200403150636832115.png',
            tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
            detail,
            btnOK: '已领取',
            onOK: function() { 
                console.log('ok') 
            },
            onCancel: function() {
                console.log('cancel')
            },
            onComplete: function() { 
                console.log('complete')
            }
        }) 
        this.bindKeys()
    }
}

const homePage = new HomePage('#homePage')
export default homePage