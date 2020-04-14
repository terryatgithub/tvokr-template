const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    devServer: { 
        contentBase: './src',
        port: 8082,
        open: true,
        inline: true,
        hot: true,
        historyApiFallback: true,
        overlay: true
    },
    watchOptions: { //webpack watch设置
        poll: 1000,
        ignored: /node_modules/,
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env.NODE_ENV': JSON.stringify('development')
        // }),
        new webpack.HotModuleReplacementPlugin(),
    ]
});