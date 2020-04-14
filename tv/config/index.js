'use strict'

const path = require('path')

module.exports = {
    dev: {
        ftpConnection: {
            host: "172.20.135.54",
            user: "appuser",
            password: "appuser.appuser"
        },
        serverDomain: 'beta.webapp.skysrt.com',
        serverDir: '/yuanbo/test/test', //只支持已存在目录下创建一层目录
        localPort: 3003,
        localDistDir: path.join(__dirname, '../dist'),
        localSrcDir: path.join(__dirname, '../src'),
        entry: 'index.html'
    },

    build: {
        ftpConnection: {
            host: '',
            user: '',
            password: ''
        },
        serverDomain: '',
        serverDir: '',
        localDistDir: path.join(__dirname, '../dist'),
        entry: 'index.html'
    }
}