# 418 会员日 TV端活动

## 1. 进行开发
    ### 使用后台测试环境接口开发
    1) pc端开发(推荐)
        npm run dev
        会自动打开浏览器，直接调试即可
    2) TV端开发
        npm run deploy:dev 
        会自动发布到ftp(注意目录不能重复，目录在/config/index.js修改),
        在TV串口打开即可看

    ### 使用后台 正式环境接口 开发
    1) pc端开发

    ### 使用后台mock接口开发
    1) pc端开发
        npm run mock
        会自动打开浏览器，直接调试即可

## 2. 项目发布地址
1) 测试环境url:
    logcat -c; am start -a coocaa.intent.action.browser --es "url" "http://beta.webapp.skysrt.com/yuanbo/test/test/index.html" ; logcat -s chromium WebViewSDK  \r

    活动url说明：
    1. 默认入口配置：
        http://beta.webapp.skysrt.com/yuanbo/test/test/index.html （默认瓜分id：226， 转盘id：227）
        也可在后面自配活动id：会覆盖默认id
        http://beta.webapp.skysrt.com/yuanbo/test/test/index.html?gfid=228&cjid=229  （字母缩写，分别对应瓜分id和抽奖id）

    2. 从电竞教育等入口进入，请配置(默认入口不要配置此字段）：
        http://beta.webapp.skysrt.com/yuanbo/test/test/index.html?ccfrom=edu  （如果修改活动id，记得也要带在参数里）
        ccfrom=edu (教育入口)
        ccfrom=kid (少儿入口)
        ccfrom=game (游戏入口)

2) 正式环境url:
    https://webapp.skysrt.com/common-activity/418okr/member/index.html

    1. 默认入口配置：
        https://webapp.skysrt.com/common-activity/418okr/member/index.html（默认瓜分id：213， 转盘id：214）
        也可在后面修改活动id：会覆盖默认id
        https://webapp.skysrt.com/common-activity/418okr/member/index.html?gfid=xxx&cjid=xxx（字母缩写，分别对应瓜分id和抽奖id）

    2. 从教育少儿电竞等入口进入，请配置：
        https://webapp.skysrt.com/common-activity/418okr/member/index.html?ccfrom=edu（如果修改活动id，记得也要带在参数里,比如 ccfrom=edu&gfid=100&cjid=200）
        ccfrom=edu (教育入口)
        ccfrom=kid (少儿入口)
        ccfrom=game (游戏入口)


## 项目相关文档
    ### 0. 产品交互
        http://wiki.skyoss.com/pages/viewpage.action?pageId=12687826

    ### 1. 后台接口
    1. 秒杀接口wiki  胡璋
        wiki 
        http://wiki.skyoss.com/pages/viewpage.action?pageId=27069494
        秒杀配置后台：
        http://172.20.135.126:8082/
        id: tvshop 
        pw: tvshop

    2. 瓜分天数、抽奖接口wiki 王雪 余高峰
        wiki 
        http://172.20.155.103:3000/project/369/interface/api
        抽奖配置后台： 
        http://beta.admin.lottery.coocaatv.com/main.html
        请王雪开通权限

    3. 微信二维码接口 衡炎炎
        http://wiki.skyoss.com/pages/viewpage.action?pageId=12687826
    