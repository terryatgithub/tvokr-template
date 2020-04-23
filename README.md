# 基于酷开电视系统的Web活动开发模板
---
## Get Started
1. 配置环境
> 安装 node.js 最新版本即可
2. 下载代码
```bash
    git clone git@gitlab.skysri.com:yuanbo/tv-ccos-template.git
    cd tv/
```
3. 安装依赖
```bash 
    #建议使用淘宝镜像
    npm install -g cnpm --registry=https://registry.npm.taobao.org
    cnpm install
```
4. 开始开发
> 默认在PC端开发，编译运行后会自动在浏览器打开页面，
```bash 
    npm run dev 
```
  默认使用后台测试环境接口开发
  默认开启热更新功能，代码修改后会自动刷新浏览器页面

5. 在TV上调试
* Ctrl+C 中断步骤4的运行
* 配置发布代码的ftp
> /config/index.js 修改 serverDir 为指定目录
* 编译并发布代码
```bash
    npm run dev:deploy
```
* 以上命令会自动把打包压缩后的代码发布到ftp;  
**注意：发布时不能覆盖现有目录，所以下次发布时需要:**  
  1.或者在/config/index.js修改serverDir目录名  
  2.或者到ftp删除之前发布的目录
* 编译成功后根据编译提示在TV串口操作即可。