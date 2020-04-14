const merge = require('webpack-merge');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'production',
    // devtool: 'source-map', //'hidden-source-map',
    plugins: [
        // new UglifyJSPlugin({
        //     sourceMap: true
        // }),
        // new webpack.DefinePlugin({
        //     'proess.env.NODE_ENV': JSON.stringify('production')
        // })
    ]
})