/**
 * 后台接口 url 配置
 */
import store from '../../store/store.js'

let baseUrl = '/api', //本地代理
    actUrl,  //活动url
    drawLLuckUrl, //抽奖url
    lucyNewsUrl, //领奖url
    shopingUrl, //秒杀商品url
    wxUrl, //微信后台url
    wxAppId, //微信公众号ID
    wxPublicAccountDefaultUrl, //微信公众号二维码默认url
    mobFillUserInfoPageUrl; //手机填写领取礼品信息页面

switch(process.env.NODE_ENV) { //todo 地址确认正确的
    case 'mock': 
        baseUrl = ''
        actUrl = 'http://172.20.155.103:3000/mock/392/'
        drawLLuckUrl = 'http://172.20.155.103:3000/mock/392/'
        lucyNewsUrl = 'http://172.20.155.103:3000/mock/369/'
        shopingUrl = 'https://beta-api-tvshop.coocaa.com/cors/'
        wxUrl = 'https://beta-wx.coocaa.com/cors/'
        wxAppId = 'wxee96df3337b09cb5' //酷开玩家
        wxPublicAccountDefaultUrl = 'http://weixin.qq.com/q/023Aku83F7b-T100000072'
        mobFillUserInfoPageUrl = 'http://beta.webapp.skysrt.com/zy/2020418/mobile/index.html'
        store.setActiviyId(226, 227)
        break;
    case 'development': 
        baseUrl = ''
        actUrl = 'https://beta-restful.coocaa.com/'
        drawLLuckUrl = 'https://beta-restful.coocaa.com/'
        lucyNewsUrl = drawLLuckUrl + '/building/'
        shopingUrl = 'https://beta-api-tvshop.coocaa.com/cors/'
        wxUrl = 'https://beta-wx.coocaa.com/cors/'
        wxAppId = 'wxee96df3337b09cb5' //酷开玩家
        wxPublicAccountDefaultUrl = 'http://weixin.qq.com/q/023Aku83F7b-T100000072'
        mobFillUserInfoPageUrl = 'http://beta.webapp.skysrt.com/zy/2020418/mobile/index.html'
        store.setActiviyId(226, 227) 
        break;
    case 'production': 
        baseUrl = ''
        actUrl = 'https://restful.skysrt.com/'
        drawLLuckUrl = 'https://restful.skysrt.com/'
        lucyNewsUrl = drawLLuckUrl + '/building/'
        shopingUrl = 'https://api-tvshop.coocaa.com/cors/'
        wxUrl = 'https://wx.coocaa.com/cors/'
        wxAppId = 'wx5a6d3bdcd05fb501' //酷开爱看电视
        wxPublicAccountDefaultUrl = 'http://weixin.qq.com/q/02c8opsCULbkT10000007U'
        mobFillUserInfoPageUrl = 'https://webapp.skysrt.com/common-activity/418okr/mobile/index.html'
        store.setActiviyId(218, 217) //正式活动id
        break;    
}

export default {
    actUrl,
    drawLLuckUrl,
    lucyNewsUrl,
    shopingUrl,
    wxUrl,
    wxAppId,
    wxPublicAccountDefaultUrl,
    mobFillUserInfoPageUrl
}