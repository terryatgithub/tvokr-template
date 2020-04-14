import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/route.js'
import '../../css/home.scss'
import {myaward} from '../middleware/middleware.js'

var homePage = new ccView({
	name: 'home',
	id: '#homePage',
	data: {
        title: 'home page title',
        tips: 'this is some text used to placeholding............',
        curFocus: 0,
        hasCollectedDividend: false,//是否已经领取过瓜分权益
        luckDrawInfo: { //抽奖任务相关
            isVip: false,
            vipType: 0,
            overNum: 0,
            vipSourceId: {
                'movieiyiqi': 1, //影视奇异
                'movietencent': 5, //影视腾讯
                'edu': 58, //教育
                'kid': 57, //少儿
                'game': 56 //电竞
            }
        },
        isDrawingNow: false,//按钮正在抽奖中
        seckillGoodsInfo: null, //秒杀商品详情
        seckillTimer: null, //秒杀商品倒计时timer
        seckillDayNum: 0, //获取今天的秒杀商品还是明天的
        seckillRoundNum: 0, //当天秒杀的场次
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
                        button_state: ctx.data.luckDrawInfo.belongVip 
                    })
                    ctx._goVipBuyPage(type)
                    break;
                case 'seckillitem':
                    ctx._goSeckillPage($(this))
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
                ctx.initSeckillItems()
                break;
            case 'seckillShowTmrItems':
                ctx.initSeckillItems(1)
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
        await this.initSeckillItems()

        if(ccStore.state.actStates === 'end' || this.data.luckDrawInfo.startDayNum >= 10) { //活动结束
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
        this.data.seckillTimer && clearTimeout(this.data.seckillTimer)
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
		$(this.id).hide()
    },
    async _refreshDaysNStocks() { //刷新剩余天数和库存数
        console.log('_refreshDaysNStocks... every 10s')
        let delay = 15000
        this.data.pageRefreshTimer && clearTimeout(this.data.pageRefreshTimer)
        if(ccDialog.isShow()) { //如果有弹窗，delay后再继续
            this.data.pageRefreshTimer = setTimeout(this._refreshDaysNStocks.bind(this), delay)
            return 
        }        
        let p1 = ccApi.backend.act.getDividDaysLeft(),
            p2 = this.initSeckillItems(this.data.seckillDayNum)
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
    async autoCollectCoupon(data) { //进入活动时自动领取后台派发的优惠券
        let pic = '', draw, collect;
        if(data.entryType > 0) {
            let ret = await ccApi.backend.act.actSetCrowd()
            console.log('设置人群: ' + JSON.stringify(ret))
            if(ret.code !== '50100') {
                if(!this.autoCollectCoupon.first) {
                    this.autoCollectCoupon.first = true
                    this.autoCollectCoupon(data)
                    return //重试一次
                }
                return //终止流程
            }
        }

        if(data.overNum > 0) {
            draw = await ccApi.backend.act.doLuckDraw(1)
            console.log('自动领取优惠券 抽奖: ' + JSON.stringify(draw)) 
            if(draw.code !== '50100') {
                console.log('自动领取优惠券错误')
                return
            }
            collect = await myaward.showRewardDialog(draw.data, this, false)
            console.log('领奖结果: ' + collect)
            pic = draw.data.awardUrl
        } else if(data.allUsedNumber > 0) {
            this.data.hasCollectedDividend = true
            pic = data.couponUrl   
        }
        
        console.log(pic)
        if(pic) {
            let els = $('.vipbuyinfo.current-source')
            els.children().css('background-image', `url(${pic})`)    
        }
    },
    async initDividTask() {
        try {
            let res = await ccApi.backend.act.initDividTask(),
                ctx = this,
                page_state = '加载成功',
                activity_stage = '活动期间',
                vipRes;
            console.log('瓜分init: ' + JSON.stringify(res))
            if(res.code === '50100') {
                ccStore.setUserKeyId(res.data.userKeyId)
                await this.autoCollectCoupon(res.data)
                $(`${this.id} .left-day`).text(res.data.dayNum)
                let awards = res.data.rememberEntities
                if(awards) {
                    while(!vipRes) {//bugfix 瓜分权益失败弹窗点刷新按钮后焦点丢失问题
                        vipRes = await myaward.showRewardDialog(awards, ctx)
                    }
                } 
                if(res.data.isLate) {
                    ccData.submitLogShow({
                        page_name: '瓜分VIP会员弹窗-已瓜分完',
                        page_type: 'inactivityWindows',
                   })
                    await ccDialog.show({
                        title: '来晚了~<br>今日的影视VIP奖池已被瓜分完啦',
                        icon: require('../../images/dialog/iconfail.png'),
                        state: '已瓜分完',
                        btnOK: '知道了',
                        onOK: function() { 
                            console.log('ok') 
                            ccData.submitLogClick({
                                page_name: '瓜分VIP会员弹窗-已瓜分完',
                                page_type: 'inactivityWindows',
                                button_name: '知道了-已瓜分完',
                            })
                        },
                        onCancel: function() {
                            console.log('cancel')
                        },
                        onComplete: function() { 
                            console.log('complete')
                            ctx.bindKeys()
                        }
                    }) 
                }
            }else if(res.code == '50003' || res.code === '50042') {
                $(`${this.id} .left-day`).text(0).next().find('.center').children('.actEnd').last().remove()
                ccStore.state.actStates = 'end'
                activity_stage = '已结束';
            }else {
                page_state = '加载异常';
                // throw new Error(res.code + res.msg)
            }
            ccData.setActState({page_state, activity_stage})
        } catch(e) {
            ccToast.show('提示<br>' + e)
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
                info = this.data.luckDrawInfo;
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
    async initSeckillItems(day=0) {
        try {
            console.log('startdaynum: ' + this.data.luckDrawInfo.startDayNum)
            if(this.data.luckDrawInfo.startDayNum > 10) {
                day = 10 - this.data.luckDrawInfo.startDayNum
            }
            this.data.seckillDayNum = day
            let res = await ccApi.backend.shopping.getSeckillGoodsList({
                source: ccStore.state.source,
                day
            })
            console.log( 'day: ' + day + '; 秒杀商品列表: ' + JSON.stringify(res))
            res = JSON.parse(res)
            if(res.returnCode != '200' || res.data.length === 0) {
                console.error('提示<br>秒杀商品获取失败或为空')    
                return
            }
            let list = res.data,
                arr = this._seckillCheckRound(res.data),
                products = arr.reduce((prev, cur) => {
                    prev.push(list[cur])
                    return prev
                }, [])
            this._seckillItemsUpdate(products)
            this.data.seckillGoodsInfo = products
            this.bindKeys()
            this.data.seckillTimer && clearTimeout(this.data.seckillTimer)
            this._seckillItemsCountdown()
        } catch(e) {
            console.error('提示<br>秒杀商品获取失败')
        }
    },
    _seckillCheckRound(list) { //判断是当天第几场活动
        let now = ccUtil.getNowTimeSecond() * 1000, halfHour = 1800000, 
            round = 0, len = list.length, ret = [],
            start, normalNum, curRoundIndex;
        if(list[0].sortOrder === 17) {
            ret.push(0)
        }
        if(list[1].sortOrder === 16) {
            ret.push(1)
        }
        start = ret.length
        normalNum = 5 - start
        if(now < list[start].activity_end_time + halfHour) {
            round = 0
        } else if(now < list[5].activity_end_time + halfHour) {
            round = 1
        } else if(len > 10) {
            round = 2
        }
        this.data.seckillRoundNum = round
        curRoundIndex = [...list.keys()].slice(start + round * normalNum, start + (round+1) * normalNum)       
        ret.push.apply(ret, curRoundIndex)
        console.log('seckill list: ' + JSON.stringify(ret))
        return ret.reverse()
    },
    _seckillItemsUpdate(data) {
        let all = '', ul = $('#homeSeckillItemList'), goodsId = [],
            upTarget = this.data.seckillDayNum ? '#seckillShowTmrItems' : '#seckillShowTodayItems';
        data.forEach((item, index) => {
            goodsId.push(item.activity_id)
            let img = item.activity_poster_img,
                oldPrice = item.commodityInfo.commodity_original_price,
                newPrie = item.activity_price,
                soldPercent = ((1 - (item.activity_number/item.all_stock).toFixed(2))*100).toFixed(0),
                start = item.activity_start_time,
                end = item.activity_end_time,
                stock = item.activity_number,
                allstock = item.all_stock,
                rightTarget = (index == 4) ? '#' : '';
            all += `<li class="coocaa_btn" upTarget="${upTarget}" rightTarget="${rightTarget}" data-actid="${item.activity_id}" data-start="${start}" data-end="${end}" data-stock="${stock}" data-allstock="${allstock}"  data-type="seckillitem" data-id=${index}>
                    <img class="product" src="${img}"/>
                    <div class="countdown">
                        <span></span><span></span>								
                    </div>
                    <div class="prize-zone">
                        <div>原价￥${oldPrice}</div>
                        <div>￥${newPrie}</div>
                        <div><div class="progress"></div></div>
                        <div>已售<span class="progresspercent">${soldPercent}</span>%</div>
                    </div>
                    <div class="btn_seckill"></div>
                    <img class="focusbg" src="${require('../../images/home/4framefocus.png')}"/>
                </li>`
        })
        ccStore.state.seckillGoodsInfo.seckillGoodsId = goodsId.join()
        ul.empty().html(all)
    },
    _seckillItemsCountdown() {
        let ctx = this,
            ul = $('#homeSeckillItemList'),
            now = +new Date(), 
            halfHour = 1800000,// 30*60*1000
            start, end, stock,allstock,
            state, countdown,soldPercent,
            actEnd = ccStore.state.actStates === 'end';
        Array.prototype.forEach.call(ul.children(), function(item, index){
            item = $(item)
            start = item.attr('data-start')
            end = item.attr('data-end')       
            stock = item.attr('data-stock')     
            allstock = item.attr('data-allstock')  
            item.removeClass('ended willstart')
            if(actEnd) {
                state = '已结束'
                countdown = '00:00:00'
                item.addClass('ended')
                item.children('.btn_seckill').text('已结束')
                soldPercent = 100
            } else {
                soldPercent = ((1 - (stock/allstock).toFixed(2))*100).toFixed(0)
                switch(true) {
                    case (start - now) > halfHour || ((now - end) > halfHour && ctx.data.seckillRoundNum != 2): // 未开始
                        state = '未开始'
                        countdown = ccUtil.getcountdown(start)
                        item.addClass('willstart')
                        item.children('.btn_seckill').text('敬请期待')
                        break;
                    case (start - now) > 0 && (start - now) <= halfHour: //即将开始
                        state = '即将开始'
                        countdown = ccUtil.getcountdown(start)
                        item.addClass('willstart')
                        item.children('.btn_seckill').text('即将开始')
                        break;
                    case (end - now) > 0 && (end - now) <= halfHour: //即将结束
                        if(stock>0) {
                            state = '即将结束'
                            countdown = ccUtil.getcountdown(end)
                            item.children('.btn_seckill').text('立即秒杀')
                        }else {
                            state = '已秒光'
                            item.addClass('ended')
                            countdown = '00:00:00'
                            soldPercent = 100
                            item.children('.btn_seckill').text('已秒光')
                        }
                        break;
                    case (now - end)> 0 && ((now - end) <= halfHour || ctx.data.seckillRoundNum == 2): //已结束
                        state = '已结束'
                        countdown = '00:00:00'
                        soldPercent = 100
                        item.addClass('ended')
                        item.children('.btn_seckill').text('已结束')
                        break;
                    default: //秒杀中
                        if(stock>0) {
                            state = '秒杀中'
                            countdown = ccUtil.getcountdown(end)
                            item.children('.btn_seckill').text('立即秒杀')
                        } else {
                            state = '已秒光'
                            item.addClass('ended')
                            countdown = '00:00:00'
                            soldPercent = 100
                            item.children('.btn_seckill').text('已秒光')
                        }
                        break;
                }
            }
            //状态，倒计时
            item.children('.countdown').children().first().text(state)
            item.children('.countdown').children().last().text(countdown)
            //进度条更新
            item.find('.progress').css('width', soldPercent+'%')
            item.find('.progresspercent').text(soldPercent)
        })
        if(!actEnd) {
            this.data.seckillTimer = setTimeout(this._seckillItemsCountdown.bind(this), 1000)
        }
    },
    async _goSeckillPage(el) {
        let index = el.attr('data-id'),
            actId = el.attr('data-actid'),
            productId = (this.data.seckillGoodsInfo[index]['commodity_id']).toString(),
            round = this.data.seckillRoundNum;
        console.log('_goSeckillPage: ' + index + 'actId: ' + actId)
        if(ccStore.state.actStates === 'end') {
            ccToast.show('提示<br>本次活动已结束，谢谢参与!')
            ccData.submitLogClick({
                page_name: '活动主页面',
                activity_stage: ccData.activity_stage,
                button_name: '立即秒杀' + productId,
                button_state: `第${round+1}场-` + el.children('.btn_seckill').text(),
            }) 
            return
        }
        if(!ccStore.state.hasLogin) {
            this._goLogin()
            return 
        }
        if(!this.data.luckDrawInfo.isVip) {
            ccToast.show('抱歉~<br>VIP会员才可参与秒杀~您还不是VIP会员')
            return
        }
        ccData.submitLogClick({
            page_name: '活动主页面',
            activity_stage: ccData.activity_stage,
            button_name: '立即秒杀' + productId,
            button_state: `第${round+1}场-` + el.children('.btn_seckill').text(),
        })            
        let res = await ccApi.backend.shopping.getSeckillState()
        console.log('检查秒杀状态: ' + res)
        res = JSON.parse(res)
        if(!(res.returnCode === '200' || res.returnCode === '300001')) { //进入时判断是否有权限
            res = await ccApi.backend.shopping.findOrderByAct(actId) //判断用户当前点击商品是否 1.是已秒杀商品 2.是否已付款
            console.log('检查当前商品状态: ' + res)
            res = JSON.parse(res);
            if(!(res.returnCode === '200' || res.returnCode === '300001')) {
                ccToast.show('提示<br>您已参与过本场活动，请下一场再来噢~')
                return
            } else if(res.returnCode == '200' && res.data) {
                if(res.data.payStatus == 2) {
                    ccToast.show('提示<br>您已参与过本场活动，请下一场再来噢~')
                    return
                } else { //商品订单详情页
                    ccApi.tv.startMallOrderDetail({
                        orderId: res.data.orderSn //todo
                    }) 
                    return
                }
            } 
        }        
        if(el.hasClass('willstart')) {
            ccToast.show('提示<br>秒杀还未开始，请稍后再来~')
            return
        } else if(el.hasClass('ended')) {
            ccToast.show('哎呀来晚了~<br>该商品已被秒完啦~看看其它商品吧!')
            return
        }
        
        ccStore.state.seckillGoodsInfo.start = true
        ccApi.tv.startMallDetail({
            type: 'text', 
            id: productId
        }) 
    },
    _goVipBuyPage(type) {
        let info = this.data.luckDrawInfo, idx, ccfrom = ccUtil.getUrlParam('ccfrom');
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
        let info = this.data.luckDrawInfo,
            res;
        if(ccStore.state.actStates === 'end') {
            ccToast.show('提示<br>本次活动已结束，谢谢参与!')
            return
        }
        if(!ccStore.state.hasLogin) {
            this._goLogin()
            return 
        }
        if(!this.data.luckDrawInfo.isVip) {
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
            button_state: this.data.luckDrawInfo.belongVip 
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
        await myaward.drawLuckAnimate('homeGoLuckDraw', res.data.seq)
        await myaward.showRewardDialog(res.data, this)
        this.bindKeys()
        // $('#homeGoLuckDraw').addClass('btn-focus')
    },
    _goLogin() {
        ccToast.show('提示<br>请先登录~~')
        ccStore.state.goLoginPage = true
        ccData.submitLogShowLogin({
            page_name: '418会员日活动电视端登录弹窗',
            page_type: 'inactivityWindows'
        }) 
        ccApi.tv.login()
    }
})

export default homePage