/**
 * 活动首页
 * 处理跟页面交互相关的逻辑
 */
import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/index.js'
import '../../css/home.scss'
import mw from '../middleware/index.js'

class HomePage extends ccView{
    
    constructor(selector) {
        super(selector)
        this.name = 'home page'
        this.data = {
            pageRefreshTimer: null, //页面自动刷新瓜分剩余天数和库存的timer
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
        this._updateUIBySource()
        this._showMobActQrCode()
        this._showLuckyNews()
        await this.initDivid()
        await this.initDraw()
        await this.initSeckill()
        this._updateUIWhenActEnd()
        this.bindKeys()
        this._updateUIWhenFirstIn()
        this._handlePathParam(hash)
        this._resetAutoRefreshTimer()
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
        mw.seckill.disableCountdownTimer()
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
		$(this.id).hide()
    }

    /**
     * 点击事件回调函数
     * @param {Event} e 
     */
    async onClick(e) {
        let ctx = e.data.ctx, //ctx是注册回调函数的页面对象，比如homePage对象
            id = $(this).attr('id');
        console.log(`home onClick event target: ${id}`)
        ctx._resetAutoRefreshTimer() 
        switch(id){
            case 'goAwardPage': //去‘我的奖品’
                if(!ccStore.state.hasLogin) {
                    mw.common.goLogin()
                    return 
                }
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '我的奖品'
                })
                router.push('award')
                break; 
            case 'goCheckRule': //去‘查看规则’
                router.push('rules')
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '活动规则'
                })
                break;     
            case 'goSeckillPage': //去‘我的秒杀’
                if(!ccStore.state.hasLogin) {
                    mw.common.goLogin()
                    return 
                }
                router.push('seckill')
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '我的秒杀'
                })
                break; 
            case 'homeGoLuckDraw': //点击抽奖
                await ctx._drawLuck()
                break;
            case 'backTopId':   //点击‘回到顶部’
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '回到顶部'
                })  
                ctx._initFocusWhenFirstIn(false)
               break;     
            default: //如果被点击元素没有id
                {
                    let type = $(this).attr('data-type');
                    console.log(`home onClick event target type: ${type}`)
                    switch(type) {
                        case 'vipmovie': //去‘VIP产品包’购买页
                        case 'vipall':
                            ccData.submitLogClick({
                                page_name: '活动主页面',
                                activity_stage: ccData.activity_stage,
                                button_name:  $(this).attr('data-log'),
                                button_state: ccStore.state.luckDrawInfo.belongVip 
                            })
                            ctx._goVipBuyPage(type)
                            break;
                        case 'seckillitem': //去‘秒杀商品详情页’
                            mw.seckill.goSeckillPage($(this))
                            break;
                    }
                    return
                }
        }
    }
    
    /**
     * onFocus
     * @param {Event} e 
     */
    async onFocus(e) {
        let ctx = e.data.ctx, //ctx是注册回调函数的页面对象，比如homePage对象
            id = $(this).attr('id'),
            logdata = '';
        console.log(`home onFocus event target: ${id}`)
        ctx.curFocus = $(this).index(ctx.coocaaBtns)
        switch(id) {
            case 'seckillShowTodayItems': //秒杀商品列表‘今日商品’
                ctx.initSeckill()
                break;
            case 'seckillShowTmrItems': //秒杀商品列表'明日预告'
                ctx.initSeckill(1)
                break;    
            case 'homeGoLuckDraw': //数据采集之分屏焦点
                logdata = '第二屏'
                break;       
        }
        let type = $(this).attr('data-type'),
            dataName = $(this).attr('data-name');
        if(type == 'seckillitem') {
            logdata = '第三屏'
        } else if(type === 'vipmovie' && dataName === 'mainbtn') {
            logdata = '第一屏'
        }
        if(logdata) {
            ccData.submitLogShow({
                page_name: '活动主页面',
                page_state: ccData.page_state,
                activity_stage: ccData.activity_stage,
                source_page: ccStore.state.ccfrom,
                split_screen: logdata
            })
        }
    }
    
    /**
     * 绑定当前页面按钮
     */
    bindKeys() {
        let btns = $(this.coocaaBtns)
        ccMap.init(btns, $(btns[this.curFocus]), "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.onClick)
        ccEvent.bindFocus(btns, {ctx:this}, this.onFocus)
    }

    /**
     * 解绑按钮
     */
    _unbindKeys() {
        ccMap.init('', '', "")
        ccEvent.unbindAllKeys($(this.coocaaBtns))
    }
    
    /**
     * 设置焦点到指定元素
     * @param {Object} focus: $(selector) 
     */
    _udpateFocus(focus) {
        let btns = $(this.coocaaBtns), 
            cur;
        if(focus) {
            this.curFocus = $(this.coocaaBtns).index(focus);
        } 
        cur = focus || $(btns[this.curFocus])
        ccMap.init(btns, cur, "btn-focus")
        cur.trigger('itemFocus')
    }

    /**
     * 设置进入活动时或‘回到顶部’的默认落焦
     * @param {Boolean} bFirstIn 是否首次进入活动页面
     */
    _initFocusWhenFirstIn(bFirstIn=true) {
        let focus;
        if(bFirstIn && ccUtil.getUrlParam('ccport') === 'xiaojiayuan') { //首次并且从小家园进入
            focus = $('#homeSeckillItemList .coocaa_btn:first')
        } else {
            if(ccStore.state.ccfrom !== 'movie') {
                focus = $('#homeGoLuckDraw')
            } else {
                focus = $('[data-type="vipmovie"]').eq(0)
            }
        }
        this._udpateFocus(focus)
    }

    /**
     * 首次进入活动首页的UI流程处理
     * 只在首次进入时执行一次
     */
    _updateUIWhenFirstIn() {
        console.log(`resetInitFocus... ${this._updateUIWhenFirstIn.inited}`)
        if(this._updateUIWhenFirstIn.inited) return;
        if(ccStore.state.ccfrom) {
            $('.second-zone').remove()
            $('.privilege-list').attr('src', `${require('../../images/home/1previlege3.png')}`)
            $('#goAwardPage').attr('downTarget', '#homeGoLuckDraw')
            $('#goCheckRule').attr('downTarget', '#homeGoLuckDraw')
            $('#goSeckillPage').attr('downTarget', '#homeGoLuckDraw')
        }
        if(ccStore.state.actStates !== 'end') {
            this._initFocusWhenFirstIn()
        } 
        ccData.submitLogShow({
            page_name: '活动主页面',
            page_state: ccData.page_state,
            load_duration: ccUtil.getNowTimeSecond() - ccData.timePageStart,
            activity_stage: ccData.activity_stage,
            source_page: ccStore.state.ccfrom
        })
        this._updateUIWhenFirstIn.inited = true
    }

    /**
     * 从其它页面跳转到首页指定位置
     * @param {String} hash 路由参数
     */
    _handlePathParam(hash) { 
        if(!hash) return 
        hash = hash.split('&')
        hash.find(item => {
            item = item.split('=')
            if(item[0] === 'focus') { 
                let focus
                if(item[1] === 'draw') {
                    focus = $('#homeGoLuckDraw')
                } if(item[1] === 'divide') {
                    focus = $('[data-type="vipmovie"]').eq(0)
                } else if(item[1] === 'seckill') {
                    focus = $('#homeSeckillItemList .coocaa_btn:first')
                }
                this._udpateFocus(focus)
                return true
            }
        })
    }

    /**
     * 根据视频源更新页面显示
     */
    _updateUIBySource() {
        console.log('source: ' + ccStore.state.source)
        if(ccStore.state.source === 'tencent') {
            $('.vipbuyinfo').eq(0).removeClass('current-source')
            $('.vipbuyinfo').eq(1).removeClass('current-source')
            $('.vipbuyinfo').eq(2).addClass('current-source')
            $('.vipbuyinfo').eq(3).addClass('current-source')
        }        
        let els = $('.vipbuyinfo.current-source')
        els.addClass('coocaa_btn')
        if(ccStore.state.source === 'tencent') {
            els.eq(0).css('background-image', `url(${require('../../images/home/2labelseasontencent.png')})`)
            els.eq(1).css('background-image', `url(${require('../../images/home/2labelyeartencent.png')})`)    
        }
    }

    /**
     * 活动结束时，更新页面
     */
    _updateUIWhenActEnd() {
        if(ccStore.state.actStates === 'end') { //活动结束
            $(`${this.id} .draw-num`).next().find('.center').children('.actEnd').last().remove()
            $('#homeGoLuckDraw').css('background-image', `url(${require('../../images/draw/btnend.png')})`)
        }
        //活动结束或秒杀时间超过第10天，不再配置明日商品
        if(ccStore.state.actStates === 'end' || ccStore.state.luckDrawInfo.startDayNum >= 10) { 
            $('#seckillShowTmrItems').remove()
        }
    }

    /**
     * 显示移动端活动二维码
     */
    async _showMobActQrCode() {
        let p1 = ccApi.backend.wx.getTmpQrcode(1),
            p2 = ccApi.backend.wx.getTmpQrcode(2),
            url1 = ccApi.backend.wx.getDefaultUrl(),
            url2 = url1;
        let [res1, res2] = await Promise.all([p1, p2])
        url1 = res1.code == 200 ? res1.data : url1
        url2 = res2.code == 200 ? res2.data : url2
        ccUtil.showQrCode({
            id: 'qrGoMobLuckDrawPage',
            url: url1
        })
        ccUtil.showQrCode({
            id: 'qrGoMobSeckillPage',
            url: url2
        })                                                           
    }
    
     /**
     * 显示中奖消息
     */
    async _showLuckyNews() {
        let ul = $('#homeLuckyNewsList')
        await mw.myaward.showLuckyNews(ul)
    }

    /**
     * 瓜分活动初始化
     */
    async initDivid() { 
        let res = await mw.divid.initDividTask()
        if(res) {
            if(res.resMsg === 'ok') {
                $(`${this.id} .left-day`).text(res.dayNum)
            } else if(res.resMsg === 'end') {
                $(`${this.id} .left-day`).text(0).next().find('.center').children('.actEnd').last().remove()
            }
        }
    }
    
    /**
     * 转盘活动初始化
     */
    async initDraw() { 
        if(!ccStore.state.hasLogin) return  //未登录不能初始化抽奖
        let res = await mw.myaward.initDrawTask()
        if(res.resMsg) {
            $(`${this.id}`).find('.draw-num').text('X' + res.overNum)
        }
    }

    /**
     * 秒杀活动初始化
     * @param {Number} day 
     */
    async initSeckill(day=0) {
        let res = await mw.seckill.initSeckillItems(day)
        res && this.bindKeys() //更新秒杀商品列表后需要重新绑定，因为目前的做法会更新元素
    }

    /**
     * 去产品包购买页
     * @param {String} type 按钮元素上的产品包类型属性 
     */
    _goVipBuyPage(type) {
        let info = ccStore.state.luckDrawInfo, idx;
        if(type === 'vipall' && ccStore.state.ccfrom !== 'movie') {
            idx = ccStore.state.ccfrom
        } else {
            if(type === 'vipall') {
                switch(info.vipType) {
                    case 2: idx = 'edu'; break;
                    case 3: idx = 'kid'; break;
                    case 4: idx = 'game'; break;
                    default:
                        idx = ccStore.state.source === 'tencent' ? 'movietencent' : 'movieiyiqi'
                        break
                }
            } else {
                idx = ccStore.state.source === 'tencent' ? 'movietencent' : 'movieiyiqi'
            }
        }
        console.log('startMovieMemberCenter: ' + idx)
        ccStore.state.goVipBuyPage = true
        ccApi.tv.startMovieMemberCenter({sourceId: (info.vipSourceId[idx]).toString()})        
    }

    /**
     * 点击抽奖
     */
    async _drawLuck() { 
        this._unbindKeys()
        $('#homeGoLuckDraw').removeClass('btn-focus')
        let res = await mw.myaward.clickLuckDraw(this)
        if(res.state) {
            $(`${this.id}`).find('.draw-num').text(`X${res.overNum}`)
        }
        this.bindKeys()

    }

    /**
     * 自动刷新剩余天数和库存数
     */
    async _refreshDaysNStocks() { 
        let delay = 15000
        console.log(`_refreshDaysNStocks... every ${delay}s`)
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
        if(ccDialog.isShow()) { //如果页面有弹窗，delay后再继续
            this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), delay)
            return 
        }        
        let p1 = mw.divid.getDividDaysLeft(),
            p2 = this.initSeckill(mw.seckill.seckillDayNum)
        let [res1, res2] = await Promise.all([p1, p2])
        console.log('剩余天数: ' + res1.data.surplusDay)
        if(res1.code === '50100') {
            $(`${this.id} .left-day`).text(res1.data.surplusDay)
        }
        this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), delay)
    }

    /**
     * 用户点击按钮时，暂停页面刷新
     */
    _resetAutoRefreshTimer() {
        // let delay = 30000
        // this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
        // this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), delay)
    }

}

const homePage = new HomePage('#homePage')
export default homePage