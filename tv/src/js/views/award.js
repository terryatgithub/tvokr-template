import ccView from './view.js'
import '../../css/award.scss'

class AwardPage extends ccView{

    constructor(selector) {
        super(selector)
        this.name = 'award page'
        this.data = {
            awardsMap: {   //所有奖品信息
                curIndex: -1,
                content: '',
                privilege: '',
                allAwardsMap: new Map()
            } 
        }
    }

    /**
     * 生命周期函数 created 
     * 首次进入页面调用
     */
	async created() {
		console.log('--awardPage created')
        $(this.id).show()
        this.bindKeys()
        await this._showMyAward()
    }
    
    /**
     * 生命周期函数 destroyed 
     * 退出页面时调用
     */
    destroyed() {
        console.log('--awardPage destroyed')
        //焦点复位
        this.curFocus = 0
        $(`${this.id} .scroll-wrapper`).scrollTop(0)
        this._resetFocus()
        $(this.id).hide()
    }
    
    /**
     * 点击事件回调函数
     * @param {Event} e 
     */
    async onClick(e) {
        let ctx = e.data.ctx,
            type = $(this).attr('data-type');
        if(type === 'tab') return
        console.log(`awardPage onClick event target: ${e.target.id}`)
        ctx.curFocus = $(this).index(ctx.coocaaBtns)
        let index = $(this).attr('data-index');
        if(!index) { //去参与活动按钮
            let cur = ctx.data.awardsMap.curIndex
            ccData.submitLogClick({
                page_name: cur ? '我的权益' : '我的奖品页',
                page_type: 'inactivityWindows',
                activity_stage: ccData.activity_stage,
                button_name: '去参加活动'
            }) 
            if(cur && ccStore.state.ccfrom === 'movie'){
                ccRouter.push('home?focus=divide')
            } else {
                ccRouter.push('home?focus=draw')
            }
            return;
        }
        let curAwardInfo = ctx.data.awardsMap.allAwardsMap.get(type)[index];
        ccData.submitLogClick({
            page_name: '奖品点击',
            page_type: 'inactivityWindows',
            prize_type: ccMw.myaward.awardsTypeIdObj[curAwardInfo.awardTypeId][1],
            prize_name: curAwardInfo.awardName
        }) 
        let res = await ccMw.myaward.showRewardDialog(curAwardInfo, ctx)
        //res为true时领取完后刷新奖品状态（实体奖/优惠券/红包..)
        if(res) { 
          await ctx.refreshPage()
        }
    }

    /**
     * onFocus
     * @param {Event} e 
     */
    async onFocus(e) {
        let ctx = e.data.ctx,
            type = $(this).attr('data-type')
        console.log(`awardPage onFocus event target: ${e.target.id}`)
        ctx.curFocus = $(this).index(ctx.coocaaBtns)
        ctx._toggleHeaderFocus()
        if(type === 'tab') { 
            ctx._changeTab($(this).attr('data-id'))
            return
        }
    }

    /**
     * 往下翻页时，禁止奖品标题tab键获得焦点
     * 以免往上滚动时焦点乱跑
     */
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
    
    /**
     * 切换标题tab,显示对应标题的内容（我的奖品/我的权益)
     * @param {Number} tab 
     */
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

    /**
     * 刷新页面奖品状态
     */
    async refreshPage() {
        console.log('awardpage refreshing.... start ')
        ccToast.show('提示<br>页面刷新中，请稍候~', 10000)  
        let focus = this.data.awardsMap.curIndex
        await this._showMyAward(false)
        this._changeTab(focus)
        ccToast.hide()
        console.log('awardpage refreshing.... end ')
    }

    /**
     * 显示我的奖品
     * @param {Boolean} bindKey 
     */
    async _showMyAward(bindKey=true) {
        let res = await ccMw.myaward.getMyReward()
        this._renderAllAward(res, bindKey)
    }

    /**
     * 渲染所有奖品信息到页面（包括我的奖品和瓜分VIP权益）
     * @param {Array[Object]} res 奖品列表 
     * @param {*} bindKey 是否重新绑定按键
     */
    _renderAllAward(res, bindKey=true) {   
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
                privilege += this._renderMyPrivilege(value, key)
            } else {
                content += this._renderMyAward(value, key)
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

    /**
     * 渲染我的权益
     * @param {Array[Object]} value 某类权益列表 
     * @param {String} key 奖品类型 
     */
    _renderMyPrivilege(value, key) { 
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

    /**
     * 渲染我的奖品
     * @param {Array[Object]} value 某类奖品列表 
     * @param {String} key 奖品类型 
     */
    _renderMyAward(value, key) { //更新奖品页面
        let header = `<div class="content"> 
                        <div class="sidebar"><div class="center">${ccMw.myaward.getChineseNameByType(key)}</div></div>
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

    _resetFocus(focus) {
        let btns = $(this.coocaaBtns), f;
        if(focus) {
            this.curFocus = $(this.coocaaBtns).index(focus);
        } 
        f = focus || $(btns[this.curFocus])
        ccMap.init(btns, f, "btn-focus")
        f.trigger('itemFocus')
    }

}

const awardPage = new AwardPage('#awardPage')
export default awardPage