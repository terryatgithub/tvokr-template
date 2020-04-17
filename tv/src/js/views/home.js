/**
 * 活动首页
 * 处理跟页面交互相关的逻辑
 */
import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/route.js'
import '../../css/home.scss'
import mw from '../middleware/index.js'

class HomePage extends ccView{
    constructor(selector) {
        super(selector)
        this.name = 'home page'
        this.data = {
            curFocus: 0,
            pageRefreshTimer: null, //页面刷新瓜分剩余天数和库存的timer
        }
    }

    getBtns() {
        return `${this.id} .coocaa_btn`
    }

    _resetAutoRefreshTimer() {
        // this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
        // this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), 30000)
    }

    /**
     * onClick
     * @param {Event} e 
     */
    async clickEventHandler(e) {
        let ctx = e.data.ctx,
            id = $(this).attr('id');
        console.log(`home clickEventHandler event target: ${id}`)
        ctx._resetAutoRefreshTimer()
        switch(id){
            case 'goAwardPage':
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
            case 'goCheckRule':
                router.push('rules')
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '活动规则'
                })
                break;     
            case 'goSeckillPage':
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
            case 'homeGoLuckDraw':
                await ctx._drawLuck()
                break;
            case 'backTopId':
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '回到顶部'
                })  
                ctx._initFocusWhenFirstIn(false)
               break;     
            default: //如果元素没有id
                {
                    let type = $(this).attr('data-type');
                    console.log(`home clickEventHandler event target type: ${type}`)
                    switch(type) {
                        case 'vipmovie':
                        case 'vipall':
                            ccData.submitLogClick({
                                page_name: '活动主页面',
                                activity_stage: ccData.activity_stage,
                                button_name:  $(this).attr('data-log'),
                                button_state: ccStore.state.luckDrawInfo.belongVip 
                            })
                            ctx._goVipBuyPage(type)
                            break;
                        case 'seckillitem':
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
    async focusEventHandler(e) {
        let ctx = e.data.ctx,
            id = $(this).attr('id'),
            logdata = '';
        console.log(`home focusEventHandler event target: ${id}`)
        ctx.data.curFocus = $(this).index(ctx.getBtns())
        switch(id) {
            case 'seckillShowTodayItems':
                ctx.initSeckillActivity()
                break;
            case 'seckillShowTmrItems':
                ctx.initSeckillActivity(1)
                break;    
            case 'homeGoLuckDraw':
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
            let source_page = 'movie';
            if(ccStore.state.ccfrom) {
                source_page = ccStore.state.ccfrom
            }
            ccData.submitLogShow({
                page_name: '活动主页面',
                page_state: ccData.page_state,
                activity_stage: ccData.activity_stage,
                source_page,
                split_screen: logdata
            })
        }
    }
    /**
     * bind()
     */
    bindKeys() {
        let btns = $(this.getBtns())
        ccMap.init(btns, $(btns[this.data.curFocus]), "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.clickEventHandler)
        ccEvent.bindFocus(btns, {ctx:this}, this.focusEventHandler)
    }
    /**
     * unbind()
     */
    unbindKeys() {
        ccMap.init('', '', "")
        ccEvent.unbindAllKeys($(this.getBtns()))
    }
    /**
     * 复位焦点到指定元素
     * @param {Object} focus: $(selector) 
     */
    _resetFocus(focus) {
        let btns = $(this.getBtns()), 
            f;
        if(focus) {
            this.data.curFocus = $(this.getBtns()).index(focus);
        } 
        f = focus || $(btns[this.data.curFocus])
        ccMap.init(btns, f, "btn-focus")
        f.trigger('itemFocus')
    }
    /**
     * 首次进入活动首页时的默认落焦
     * @param {Boolean} bFirstIn 
     */
    _initFocusWhenFirstIn(bFirstIn=true) {
        let focus;
        if(bFirstIn && ccUtil.getUrlParam('ccport') === 'xiaojiayuan') {
            focus = $('#homeSeckillItemList .coocaa_btn:first')
        } else {
            if(ccStore.state.ccfrom) {
                focus = $('#homeGoLuckDraw')
            } else {
                focus = $('[data-type="vipmovie"]').eq(0)
            }
        }
        this._resetFocus(focus)
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
            source_page: ccStore.state.ccfrom || 'movie'
        })
        this._updateUIWhenFirstIn.inited = true
    }
    /**
     * 处理从其它页面跳转到首页指定位置
     * @param {String} str 路由参数
     */
    _handlePathParam(str) { 
        if(!str) return 
        str = str.split('&')
        str.find(item => {
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
                this._resetFocus(focus)
                return true
            }
        })
    }
    
	async created(str) {
        console.log('home created')
        $(this.id).show()
        this._updateUI()
        this._refreshQrCode()
        this._getLuckyNews()
        await this.initDividTask()
        await this.initDrawTask()
        await this.initSeckillActivity()
        this._updateUIWhenActEnd()
        this.bindKeys()
        this._updateUIWhenFirstIn()
        this._handlePathParam(str)
        this._resetAutoRefreshTimer()
    }
    //todo 评估必要性:
    //优化成 created() 和 mounted() created()里先加载html  mounted里放请求逻辑，以加快首屏显示
    mounted() {
        console.log('--home mounted')
        
    }
	destroyed() {
        console.log('--home destroyed')
        mw.seckill.disableTimeout()
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
		$(this.id).hide()
    }
    async _refreshDaysNStocks() { //刷新剩余天数和库存数
        let delay = 15000
        console.log(`_refreshDaysNStocks... every ${delay}s`)
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
        if(ccDialog.isShow()) { //如果有弹窗，delay后再继续
            this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), delay)
            return 
        }        
        let p1 = mw.divid.getDividDaysLeft(),
            p2 = this.initSeckillActivity(mw.seckill.seckillDayNum)
        let [res1, res2] = await Promise.all([p1, p2])
        console.log('剩余天数: ' + res1.data.surplusDay)
        if(res1.code === '50100') {
            $(`${this.id} .left-day`).text(res1.data.surplusDay)
        }
        this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), delay)
    }
    _updateUI() {
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
    async initDividTask() { 
        let res = await mw.divid.initDividTask()
        if(res) {
            if(res.resMsg === 'ok') {
                $(`${this.id} .left-day`).text(res.dayNum)
            } else if(res.resMsg === 'end') {
                $(`${this.id} .left-day`).text(0).next().find('.center').children('.actEnd').last().remove()
            }
        }
    }
    _updateUIWhenActEnd() {
        if(ccStore.state.actStates === 'end' || ccStore.state.luckDrawInfo.startDayNum >= 10) { //活动结束
            $('#seckillShowTmrItems').remove()
            $(`${this.id} .draw-num`).next().find('.center').children('.actEnd').last().remove()
            $('#homeGoLuckDraw').css('background-image', `url(${require('../../images/draw/btnend.png')})`)
        }
    }
    async initDrawTask() { 
        if(!ccStore.state.hasLogin) return  //未登录不能初始化抽奖
        let res = await mw.myaward.initDrawTask()
        if(res.resMsg) {
            $(`${this.id}`).find('.draw-num').text('X' + res.overNum)
        }
    }
    async _refreshQrCode() {
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
    async _getLuckyNews() {
        let ul = $('#homeLuckyNewsList')
        await mw.myaward.showLuckyNews(ul)
    }
    async initSeckillActivity(day=0) {
        let res = await mw.seckill.initSeckillItems(day)
        res && this.bindKeys() //更新秒杀商品列表后需要重新绑定，因为目前的做法会更新元素
    }
    _goVipBuyPage(type) {
        let info = ccStore.state.luckDrawInfo, idx;
        if(type === 'vipall' && ccStore.state.ccfrom) {
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
    async _drawLuck() { 
        this.unbindKeys()
        $('#homeGoLuckDraw').removeClass('btn-focus')
        let res = await mw.myaward.clickLuckDraw(this)
        if(res.state) {
            $(`${this.id}`).find('.draw-num').text(`X${res.overNum}`)
        }
        this.bindKeys()

    }

}

const homePage = new HomePage('#homePage')
export default homePage