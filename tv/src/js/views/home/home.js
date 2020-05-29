/**
 * 活动首页
 * 处理跟页面交互相关的逻辑
 */
import ccView from './../view.js'
import './home.scss'

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
        if(ccStore.state.autoClickAfterLogin) {
            ccStore.state.autoClickAfterLogin = false
            this._autoTriggerClick()    
        }
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

    async _needLoginFirst() {
        if(!ccStore.state.loginstatus) {
            ccStore.state.autoClickAfterLogin = true
            ccMw.tv.goLogin()
            return true
        }
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
            case 'needLoginFirst':
                alert('check login status')
                if(ctx._needLoginFirst()) {
                    alert('已登录')
                    return
                }
                alert('未登录')
                break;
            case 'goAwardPage': //去‘我的奖品’
                if(!ccStore.state.loginstatus) {
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
                if(!ccStore.state.loginstatus) {
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
            case 'toastId': 
                ccToast.show('哈喽<br>雷猴，请稍候~')  
                break;
            case 'lowerId':
                await ctx._showLowerDemo()
                break;
            case 'backendId':
                await ctx._showBackendDemo()
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
        let _alertCoinHtml = `
            <div class="dialogTitle">恭喜获得11酷币</div>
            <img id="kubiImg" src='${require('../../../images/dialog/iconok.png')}' />
        `;
        let ret = await ccDialog.show({
            innerHtml:_alertCoinHtml,
            btnOK: '继续参与',
            type: 'kubi'
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
        let _alertCoinHtml = `
            <div class="dialogTitle">第1个弹窗</div>
            <img id="kubiImg" src='${require('../../../images/dialog/iconok.png')}' />
        `;
        let ret = await ccDialog.show({
            innerHtml:_alertCoinHtml,
            btnOK: '继续参与',
            type: 'kubi'
        }) 
        _alertCoinHtml = `
            <div class="dialogTitle">第2个弹窗</div>
            <img id="kubiImg" src='${require('../../../images/dialog/iconok.png')}' />
        `;
        ret = await ccDialog.show({
            innerHtml:_alertCoinHtml,
            btnOK: '继续参与',
            type: 'kubi'
        }) 
        _alertCoinHtml = `
            <div class="dialogTitle">第3个弹窗</div>
            <img id="kubiImg" src='${require('../../../images/dialog/iconok.png')}' />
        `;
        ret = await ccDialog.show({
            innerHtml:_alertCoinHtml,
            btnOK: '继续参与',
            type: 'kubi'
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
        let _alertCoinHtml = `
            <div class="dialogTitle">发财了</div>
            <img id="kubiImg" src='${qrUrl}' />
        `;
        let ret = await ccDialog.show({
            innerHtml:_alertCoinHtml,
            btnOK: '继续参与',
            type: 'qrcode'
        }) 
        this.bindKeys()    
    }

    /**
     * demo 显示实体二维码弹窗
     */
    async _showEntityDialog() {
        ccToast.show('@.@<br>请参照其它对话框实现~详情咨询心旺')  
        // let detail = `收货人: 張三<br>手机: 13555555555<br>收货地址: 北京市前門佛阿吉爾菲娜拉爾囧附件二及分類`;
        // let ret = await ccEntityCollected.show({
        //     title: '恭喜获得实物奖',
        //     icon: 'http://res.lottery.coocaatv.com//uploads/img/20200403/20200403150636832115.png',
        //     tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
        //     detail,
        //     btnOK: '已领取'
        // }) 
        // this.bindKeys()
    }

    /**
     * demo 调用底层接口
     */
    async _showLowerDemo() {
        let info = await ccMw.tv.getDeviceInfo();
        $('#lowerInfo').html(JSON.stringify(info))
    }

    /**
     * demo 调用后台接口
     */
    async _showBackendDemo() {
        let info = await ccMw.myaward.initDrawTask();
        $('#backendInfo').html(JSON.stringify(info))
    }

}

const homePage = new HomePage('#homePage')
export default homePage