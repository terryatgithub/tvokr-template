/**
 * 瓜分活动模块-中间件层
 * 封装跟业务逻辑相关的处理
 */
import myaward from './mw_award.js'

class DividActivity {
    constructor() {

    }

    /**
     * 瓜分活动初始化
     */
    async initDividTask() {
        try {
            let res = await ccApi.backend.act.initDividTask(),
                ctx = this,
                page_state = '加载成功',
                activity_stage = '活动期间',
                vipRes,
                ret = null;
            console.log('瓜分初始化: ' + JSON.stringify(res))
            if(res.code === '50100') {
                ccStore.setUserKeyId(res.data.userKeyId)
                await this._autoCollectCoupon(res.data)
                ret = {
                    dayNum: res.data.dayNum,
                    resMsg: 'ok'
                }
                let awards = res.data.rememberEntities
                if(awards) {
                    //bugfix 瓜分权益失败弹窗点刷新按钮后焦点丢失问题, 如果用户点刷新，确保整个流程等待不往下走
                    while(!vipRes) {
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
                ret = {
                    resMsg: 'end'
                }
                ccStore.state.actStates = 'end'
                activity_stage = '已结束';
            }else {
                page_state = '加载异常';
                // throw new Error(res.code + res.msg)
            }
            ccData.setActState({page_state, activity_stage})
            return ret
        } catch(e) {
            ccToast.show('提示<br>' + e)
        }
    }

    /**
     * 获取瓜分剩余天数
     */
    async getDividDaysLeft() {
        return await ccApi.backend.act.getDividDaysLeft()
    }

    /**
     * 进入活动时自动领取后台派发的优惠券
     * @param {*} data 
     */
    async _autoCollectCoupon(data) { 
        let pic = '', 
            draw, 
            collect;
        if(data.entryType > 0) {
            let ret = await ccApi.backend.act.actSetCrowd()
            console.log('设置人群: ' + JSON.stringify(ret))
            if(ret.code !== '50100') {
                if(!this._autoCollectCoupon.first) {
                    this._autoCollectCoupon.first = true
                    this._autoCollectCoupon(data)
                    return //后台要求重试一次
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
            pic = data.couponUrl   
        }
        
        console.log(pic)
        if(pic) { //更新优惠券角标
            let els = $('.vipbuyinfo.current-source')
            els.children().css('background-image', `url(${pic})`)    
        }
    }

}

const divid = new DividActivity()
export default divid