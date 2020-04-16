/**
 * 活动首页
 * 处理跟页面相关的逻辑
 */
import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/route.js'
import '../../css/home.scss'
import mw from '../middleware/middleware.js'

var homePage = new ccView({
	name: 'home',
	id: '#homePage',
	data: {
        title: 'home page title',
        tips: 'this is some text used to placeholding............',
        curFocus: 0,
        isDrawingNow: false,//按钮正在抽奖中
        pageRefreshTimer: null, //页面刷新瓜分剩余天数和库存的timer
    },
    getBtns() {
        return `${this.id} .coocaa_btn`
    },
    _resetRefreshTimer() {
        // this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
        // this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), 30000)
    },
    async clickEventHandler(e) {
        let ctx = e.data.ctx,
            id = $(this).attr('id'),
            res = '',focus;
        console.log(`home clickEventHandler event target: ${id}`)
        ctx._resetRefreshTimer()
        if(!id) {//如果没有id
            let type = $(this).attr('data-type'),button_name, button_state;
            console.log(`home clickEventHandler event target type: ${type}`)
            switch(type) {
                case 'vipmovie':
                case 'vipall':
                    button_name =  $(this).attr('data-log')
                    ccData.submitLogClick({
                        page_name: '活动主页面',
                        activity_stage: ccData.activity_stage,
                        button_name,
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
        switch(id){
            case 'goAwardPage':
                if(!ccStore.state.hasLogin) {
                    ctx._goLogin()
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
                    ctx._goLogin()
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
                res = await ctx._homeClickLuckDraw()
                if(!res) { ctx.data.isDrawingNow = false }
                break;
            case 'backTopId':
                ccData.submitLogClick({
                    page_name: '活动主页面',
                    activity_stage: ccData.activity_stage,
                    button_name: '回到顶部'
                })  
                ctx._initFocusWhenFirstIn(false)
               break;              
        }
    },
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
            let ccfrom = ccUtil.getUrlParam('ccfrom'),
                source_page = 'movie';
            if(ccfrom) {
                source_page = ccfrom
            }
            ccData.submitLogShow({
                page_name: '活动主页面',
                page_state: ccData.page_state,
                activity_stage: ccData.activity_stage,
                source_page,
                split_screen: logdata
            })
        }
    },
    bindKeys() {
        let btns = $(this.getBtns())
        ccMap.init(btns, $(btns[this.data.curFocus]), "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.clickEventHandler)
        ccEvent.bindFocus(btns, {ctx:this}, this.focusEventHandler)
    },
    unbindKeys() {
        ccMap.init('', '', "")
        ccEvent.unbindAllKeys($(this.getBtns()))
    },
    _resetFocus(focus) {
        let btns = $(this.getBtns()), f;
        if(focus) {
            this.data.curFocus = $(this.getBtns()).index(focus);
        } 
        f = focus || $(btns[this.data.curFocus])
        ccMap.init(btns, f, "btn-focus")
        f.trigger('itemFocus')
    },
    _initFocusWhenFirstIn(bFirstIn=true) {
        let focus, ccfrom = ccUtil.getUrlParam('ccfrom');
        if(bFirstIn && ccUtil.getUrlParam('ccport') === 'xiaojiayuan') {
            focus = $('#homeSeckillItemList .coocaa_btn:first')
        } else {
            if(ccfrom) {
                focus = $('#homeGoLuckDraw')
            } else {
                focus = $('[data-type="vipmovie"]').eq(0)
            }
        }
        this._resetFocus(focus)
    },
    _resetInitFocus() { //从外部进入首页时，重置初次进入的焦点
        console.log('resetInitFocus... in')
        if(this._resetInitFocus.inited) return;
        console.log('resetInitFocus...in true')
        let ccfrom = ccUtil.getUrlParam('ccfrom');
        if(ccfrom) {
            $('.second-zone').remove()
            $('.privilege-list').attr('src', `${require('../../images/home/1previlege3.png')}`)
            $('#goAwardPage').attr('downTarget', '#homeGoLuckDraw')
            $('#goCheckRule').attr('downTarget', '#homeGoLuckDraw')
            $('#goSeckillPage').attr('downTarget', '#homeGoLuckDraw')
        }
        if(ccStore.state.actStates !== 'end') {
            this._initFocusWhenFirstIn()
        } 
        let source_page = 'movie';
        if(ccfrom) {
            source_page = ccfrom
        }
        ccData.submitLogShow({
            page_name: '活动主页面',
            page_state: ccData.page_state,
            load_duration: ccUtil.getNowTimeSecond() - ccData.timePageStart,
            activity_stage: ccData.activity_stage,
            source_page
        })
        this._resetInitFocus.inited = true
    },
    _handlePathParam(str) { //页面内部跳转时用参数判断
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
    },
	async created(str) {
        console.log('--home created: ', ccStore.getters.commonParam())
        $(this.id).show()
        this._updateUIMsg()
        this.refreshQrCode()
        this._getLuckyNews()
        await this.initDividTask()
        if(ccStore.state.hasLogin) {
            await this.initDrawTask()
        } else if(ccStore.state.actStates === 'end') {
            this._updateActEndUI()
        }
        await this.initSeckillActivity()

        if(ccStore.state.actStates === 'end' || ccStore.state.luckDrawInfo.startDayNum >= 10) { //活动结束
            $('#seckillShowTmrItems').remove()
        }
        this.bindKeys()
        this._resetInitFocus()
        this._handlePathParam(str)
        this._resetRefreshTimer()
    },
    //todo 评估必要性:
    //优化成 created() 和 mounted() created()里先加载html  mounted里放请求逻辑，以加快首屏显示
    mounted() {
        console.log('--home mounted')
        
    },
	destroyed() {
        console.log('--home destroyed')
        mw.seckill.disableTimeout()
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
		$(this.id).hide()
    },
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
    },
    _updateUIMsg() {
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
    },
    async autoCollectCoupon(data) { 
        $(`${this.id} .left-day`).text(res.data.dayNum)
    },
    async initDividTask() { 
        let res = await mw.divid.initDividTask()
        if(res) {
            if(res.resMsg === 'ok') {
                $(`${this.id} .left-day`).text(res.dayNum)
            } else if(res.resMsg === 'end') {
                $(`${this.id} .left-day`).text(0).next().find('.center').children('.actEnd').last().remove()
            }
        }
    },
    _updateActEndUI() {
        $(`${this.id} .draw-num`).next().find('.center').children('.actEnd').last().remove()
        $('#homeGoLuckDraw').css('background-image', `url(${require('../../images/draw/btnend.png')})`)
    },
    async initDrawTask() { 
        try {
            let res = await ccApi.backend.act.initDrawTask()
            console.log('转盘init: ' + JSON.stringify(res))
            if(res.code == '50003' || res.code === '50042') {
                ccStore.state.actStates = 'end'
                this._updateActEndUI()
            } else if(res.code != '50100') {
                throw new Error(res.code + res.msg)
            } 
            let {isVip, vipType, overNum, belongVip, startDayNum} = res.data,
                info = ccStore.state.luckDrawInfo;
            info.isVip = isVip
            info.vipType = vipType
            info.overNum = overNum
            info.belongVip = belongVip
            info.startDayNum = startDayNum
            $(`${this.id}`).find('.draw-num').text('X' + overNum)
        } catch(e) {
            // ccToast.show('提示<br>' + e)
            console.error(e)
        }
    },
    async refreshQrCode() {
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
    },
    async _getLuckyNews() {
        let res = await ccApi.backend.act.getLuckyNews()
        console.log('中奖消息: ' + JSON.stringify(res))
        if(res.code !== '50100') {
            return
        }
        this._updateLuckyNews(res.data)
    },
    _updateLuckyNews(news) {
        let li = '',
            ul = $('#homeLuckyNewsList'),
            list = news.fakeNews.map(item => {
                let name = item.nickName, nameLen = name.length,
                    award = item.awardName;
                name = nameLen > 5 ? name.charAt(0)+'****'+name.charAt(nameLen-1) : name
                // award = award.length > 3 ? award.slice(0,3).concat('...') : award
                return `恭喜 ${name} 抽中 ${award}`
            })
        list.forEach(item => {
            li += `<li>${item}</li>`
        })
        ul.empty().html(li)
        function _animScrollTop() {
            let $first = ul.find('li:first'), h = $first.height()
            $first.animate({ marginTop: `${-h}px` }, 500, function(){
                $first.css('marginTop', 0).appendTo(ul)
            })
        }
        setInterval(_animScrollTop, 2000)
    },
    async initSeckillActivity(day=0) {
        let res = await mw.seckill.initSeckillItems(day)
        res && this.bindKeys()
    },
    _goVipBuyPage(type) {
        let info = ccStore.state.luckDrawInfo, idx, ccfrom = ccUtil.getUrlParam('ccfrom');
        if(type === 'vipall' && ccfrom) {
            idx = ccUtil.getUrlParam('ccfrom')
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
    },
    async _homeClickLuckDraw() {
        if(this.data.isDrawingNow) {return true}
        this.data.isDrawingNow = true
        let info = ccStore.state.luckDrawInfo,
            res;
        if(ccStore.state.actStates === 'end') {
            ccToast.show('提示<br>本次活动已结束，谢谢参与!')
            return
        }
        if(!ccStore.state.hasLogin) {
            this._goLogin()
            return 
        }
        if(!ccStore.state.luckDrawInfo.isVip) {
            ccToast.show('提示<br>抱歉~您还不是VIP会员~')
            return
        }
        if (info.overNum < 1) {
            ccToast.show('抱歉，您今日抽奖次数已用完啦<br>购买VIP赢继续抽奖机会~')
            return 
        }
        ccData.submitLogClick({
            page_name: '活动主页面',
            activity_stage: ccData.activity_stage,
            button_name: '立即抽奖',
            button_state: ccStore.state.luckDrawInfo.belongVip 
        })
        res = await ccApi.backend.act.doLuckDraw()
        console.log('抽奖: ' + JSON.stringify(res))
        if(res.code === '50004') {
            info.overNum = 0
            $(`${this.id}`).find('.draw-num').text('X0')
            ccToast.show('抱歉，您今日抽奖次数已用完啦<br>购买VIP赢继续抽奖机会~')
            return 
        } else if(res.code !== '50100') {
            ccToast.show('提示<br>网络异常请重试~')
            return 
        }
        $(`${this.id}`).find('.draw-num').text('X' + --info.overNum)
        $('#homeGoLuckDraw').removeClass('btn-focus')
        this.unbindKeys()
        await mw.myaward.drawLuckAnimate('homeGoLuckDraw', res.data.seq)
        await mw.myaward.showRewardDialog(res.data, this)
        this.bindKeys()
        // $('#homeGoLuckDraw').addClass('btn-focus')
    },

})

export default homePage