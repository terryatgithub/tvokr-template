/**
 * 本地mock模块
 * 目前mock模式用的是后台mock服务器，没有用该模块
 * @todo 尚未完全用起来，待完善
 */
import Mock from 'mockjs'

// 使用方法: 
//step 1. npm install mockjs
//step 2. import './mock/mock.js' 
//step 3. 在需要的地方调用:
// let res = await util.post({
//     url: '/news/index',
//     data: {}
// })

// 获取 mock.Random 对象
const Random = Mock.Random;
// mock一组数据
const produceNewsData = function() {
    let articles = [];
    for (let i = 0; i < 100; i++) {
        let newArticleObject = {
            title: Random.csentence(5, 30), //  Random.csentence( min, max )
            thumbnail_pic_s: Random.dataImage('300x250', 'mock的图片'), // Random.dataImage( size, text ) 生成一段随机的 Base64 图片编码
            author_name: Random.cname(), // Random.cname() 随机生成一个常见的中文姓名
            date: Random.date() + ' ' + Random.time() // Random.date()指示生成的日期字符串的格式,默认为yyyy-MM-dd；Random.time() 返回一个随机的时间字符串
        }
        articles.push(newArticleObject)
    }
 
    return {
        articles: articles
    }
}
 
// Mock.mock( url, post/get , 返回的数据)；
Mock.mock('/news/index', 'post', produceNewsData);

//秒杀mock数据
// 1. 我的秒杀
const mySeckillGoods =  function() {
    return {
        "data": [
            {
                "address":"北京市市辖区东城区你好",
                "goodsImg":"https://img.coocaa.com/java-manage/images/20191230/4f2da02e-f1c9-42be-9301-17f0b42e3a45.jpg",
                "goodsName":"hh商品003",
                "mobile":"188****6369",
                "orderSn":"T200304155726438bg",
                "shopPrice":"0"
            },
            {
                "address":"北京市市辖区东城区你好",
                "goodsImg":"https://img.coocaa.com/java-manage/images/20191230/4f2da02e-f1c9-42be-9301-17f0b42e3a45.jpg",
                "goodsName":"hh商品003",
                "mobile":"188****6369",
                "orderSn":"T200304155726438bg",
                "shopPrice":"0"
            },
            {
                "address":"北京市市辖区东城区你好",
                "goodsImg":"https://img.coocaa.com/java-manage/images/20191230/4f2da02e-f1c9-42be-9301-17f0b42e3a45.jpg",
                "goodsName":"hh商品003",
                "mobile":"188****6369",
                "orderSn":"T200304155726438bg",
                "shopPrice":"0"
            }
        ],
        "message":"",
        "returnCode":"200"
    }
}
Mock.mock(RegExp('/tvOrderAPI/v1/actOrderList'+'.*'), 'get', mySeckillGoods)
