import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/route.js'
import '../../css/award.scss'
import mw from '../middleware/index.js'

class AwardPage extends ccView{
    constructor(selector) {
        super(selector)
        this.name = 'award page'
        this.data = {
            curFocus: 0,
            awardsMap: {   //所有奖品信息
                curIndex: -1,
                content: '',
                privilege: '',
                allAwardsMap: new Map()
            } 
        }
    }
 
    getBtns() {
        return (`${this.id} .coocaa_btn`)
    }
    
    async clickEventHandler(e) {
        let ctx = e.data.ctx,
            type = $(this).attr('data-type');

        if(type === 'tab') return
        
        console.log(`awardPage clickEventHandler event target: ${e.target.id}`)
        ctx.data.curFocus = $(this).index(ctx.getBtns())
        let index = $(this).attr('data-index');
        if(!index) { //去参与活动按钮
            let cur = ctx.data.awardsMap.curIndex
            ccData.submitLogClick({
                page_name: cur ? '我的权益' : '我的奖品页',
                page_type: 'inactivityWindows',
                activity_stage: ccData.activity_stage,
                button_name: '去参加活动'
            }) 
            if(cur && !ccStore.state.ccfrom){
                router.push('home?focus=divide')
            } else {
                router.push('home?focus=draw')
            }
            return;
        }
        let curAwardInfo = ctx.data.awardsMap.allAwardsMap.get(type)[index];
        ccData.submitLogClick({
            page_name: '奖品点击',
            page_type: 'inactivityWindows',
            prize_type: mw.myaward.awardsTypeIdObj[curAwardInfo.awardTypeId][1],
            prize_name: curAwardInfo.awardName
        }) 
        let res = await mw.myaward.showRewardDialog(curAwardInfo, ctx)
        if(res) { //res为true时领取完后查询状态变化（实体奖/优惠券/红包..)
          await ctx.refreshPage()
        }
    }
    async refreshPage() {
        console.log('awardpage refreshing.... start ')
        ccToast.show('提示<br>页面刷新中，请稍候~', 10000)  
        let focus = this.data.awardsMap.curIndex
        await this._getMyReward(false)
        this._changeTab(focus)
        ccToast.hide()
        console.log('awardpage refreshing.... end ')
    }
    _toggleHeaderFocus() {
        let scrollTop = $(`${this.id} .scroll-wrapper`).scrollTop()
        if(scrollTop > 10) { //根据页面布局隐藏tab标签，否则焦点会乱
            $(`${this.id} .header`).children('.coocaa_btn').hide()
            $(`${this.id} .header`).children().not('.coocaa_btn').css('display', 'inline-block')
        } else {
            $(`${this.id} .header`).children('.coocaa_btn').show()
            $(`${this.id} .header`).children().not('.coocaa_btn').hide()
        }
    }
    async FocusEventHandler(e) {
        let ctx = e.data.ctx,
            type = $(this).attr('data-type')
        console.log(`awardPage FocusEventHandler event target: ${e.target.id}`)
        ctx.data.curFocus = $(this).index(ctx.getBtns())
        ctx._toggleHeaderFocus()
        if(type === 'tab') { 
            ctx._changeTab($(this).attr('data-id'))
            return
        }
    }
    bindKeys() {
        let btns = $(this.getBtns())
        ccMap.init(btns, btns[this.data.curFocus], "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.clickEventHandler)
        ccEvent.bindFocus(btns, {ctx:this}, this.FocusEventHandler)
    }
    _changeTab(tab = 0) {
        if(this.data.awardsMap.curIndex == tab) { return } 
        let children = $('#awardPage .header').children()
        children.removeClass('highlight')
        children.filter(function(index){
                return index % 2 == tab
            }).addClass('highlight')
        if (tab == 0) {
            $('#awardWrapperId').empty().html(this.data.awardsMap.content)
            $('#privilegeWrapperId').empty()
        } else {
            $('#awardWrapperId').empty()
            $('#privilegeWrapperId').empty().html(this.data.awardsMap.privilege)
            let info = this.data.awardsMap.allAwardsMap,
                content = info && info.get('vip')
            ccData.submitLogShow({
                page_name: '我的权益',
                page_state: content ? '已获得瓜分权益' : '未获得瓜分权益',
                activity_stage: ccData.activity_stage
            }) 
        }
        this.data.awardsMap.curIndex = tab
        this.bindKeys()
    }
    async _getMyReward(bindKey=true) {
        let res = await mw.myaward.getMyReward()
        this._updatePage(res, bindKey)
    }
    _updatePage(res, bindKey=true) { //更新页面奖品信息
        let content = '',//奖品信息
            privilege = '', //vip权益信息
            isEnd = ccStore.state.actStates === 'end',
            tipContentActEnd = isEnd ? '活动已结束，欢迎下次参与~' : '暂无奖品，快去参加活动吧~',
            tipPrivilegeActEdn = isEnd ? '活动已结束，欢迎下次参与~' : '暂无瓜分权益~',
            emptyContent = `<div class="empty-wrapper">
                                <div class="tips">${tipContentActEnd}</div>
                                ${ isEnd ? '' : '<div class="coocaa_btn btn"></div>'}
                            </div>`,
            emptyPrivilege = `<div class="empty-wrapper">
                                <div class="tips">${tipPrivilegeActEdn}</div>
                                ${ isEnd ? '' : '<div class="coocaa_btn btn" upTarget="#awardPagePrivilegeId"></div>'}
                            </div>`;
        res && res.forEach((value, key) => {
            if (key === 'vip') {
                privilege += this._updatePrivilegeInfo(value, key)
            } else {
                content += this._updateAwardInfo(value, key)
            }
        })
        this.data.awardsMap = {
            curIndex: -1,
            content: content || emptyContent,
            privilege: privilege || emptyPrivilege,
            allAwardsMap: res
        }
        if(bindKey) {
            this._changeTab()
            ccData.submitLogShow({
                page_name: '我的奖品页',
                page_state: content ? '已获得奖品' : '未获得奖品',
                activity_stage: ccData.activity_stage
            })       
        }
    }
    _updatePrivilegeInfo(value, key) { //更新权益页面
        let header = `<ul>`,
            body = '',
            footer = `</ul>`;
        body = value.reduce((prev, cur, index) => {
            let usedClass = cur.awardExchangeFlag !== 0 ? 'collected' : '',
                upTarget = index ? '' : "#awardPagePrivilegeId";
            let li = `<li class="coocaa_btn ${key}" data-index=${index} data-type=${key} upTarget="${upTarget}">
                        <img src="${cur.awardUrl}" />
                        <div class="title text">恭喜您成功瓜分${cur.awardName}</div>
                        <div class="tips text">*领取成功后，将直接发放到您当前的账户</div>
                        <div class="btn ${usedClass}"></div>
                    </li>`
            return prev += li        
        }, '')
        return header + body + footer
    }
    _updateAwardInfo(value, key) { //更新奖品页面
        let header = `<div class="content"> 
                        <div class="sidebar"><div class="center">${mw.myaward.getChineseNameByType(key)}</div></div>
                        <ul class="list-wrapper">`,
            body = '',
            foot = `    </ul>
                    </div>`;
        body = value.reduce((prev, cur, index) => {
            let usedClass = ''
            switch(cur.awardTypeId) {
                case '7': 
                    if(cur.awardExchangeFlag == 2) {//后台规定微信红包过滤状态2
                        return prev
                    }
                    usedClass = cur.awardExchangeFlag == 1 ? 'collected' : ''
                    break
                case '2': 
                    usedClass = cur.awardExchangeFlag == 1 ? 'collected' : ''
                    break;
                default: 
                    if(cur.awardExchangeFlag == 1) { //已领取，去使用
                        usedClass = 'gouse'
                    } else if(cur.awardExchangeFlag == 2) { //已使用
                        usedClass = 'used' 
                    } else if(cur.awardExchangeFlag == 3) { //已过期
                        usedClass = 'timeout' 
                    } 
                    break;
            }
            let title = key === 'wxredbag' ? 
                        JSON.parse(cur.awardInfo).bonus : 
                        `恭喜获得${cur.awardName}`;
            let li = `<li class="coocaa_btn ${key} ${cur.awardExchangeFlag?'collected':''}"  data-index=${index} data-type=${key}>
                        <img src="${cur.awardUrl}" />
                        <div class="title">${title}</div>
                        <div class="btn ${usedClass}"></div>
                    </li>`;
            return prev += li
        }, '')
        return header + body + foot
    }
	async created() {
		console.log('--awardPage created')
        $(this.id).show()
        this.bindKeys()
        await this._getMyReward()
    }
    _resetFocus(focus) {
        let btns = $(this.getBtns()), f;
        if(focus) {
            this.data.curFocus = $(this.getBtns()).index(focus);
        } 
        f = focus || $(btns[this.data.curFocus])
        ccMap.init(btns, f, "btn-focus")
        f.trigger('itemFocus')
    }
	destroyed() {
		console.log('--awardPage destroyed')
        this.data.curFocus = 0
        $(`${this.id} .scroll-wrapper`).scrollTop(0)
        this._resetFocus()
        $(this.id).hide()
	}
}

const awardPage = new AwardPage('#awardPage')
export default awardPage