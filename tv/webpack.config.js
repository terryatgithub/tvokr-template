const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
    mode: 'development', // 'production', 'development',
    entry: ['./src/js/index.js'],
    // devtool: 'inline-source-map', 
    output: {
        filename: 'js/bundle-[hash:8].js',
        path: path.join(__dirname, 'dist')
    },
    devServer: { //webpack-dev-server设置
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
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.js$/, // 使用正则来匹配 js 文件
                exclude: /node_modules/, // 排除依赖包文件夹
                include: path.resolve(__dirname, "src/js"),
                use: {
                    loader: 'babel-loader', // 使用 babel-loader
                    options: {
                        cacheDirectory: true
                    }
                  }
            },
            {
                test: /\.js$/, // 使用正则来匹配 js 文件
                exclude: /nodes_modules/, // 排除依赖包文件夹
                include: path.resolve(__dirname, "src/js"),
                use: {
                  loader: 'eslint-loader' // 使用 eslint-loader
                }
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "../", //!!!background:url()可用
                        }
                    },
                    // {
                    //     loader: 'style-loader'
                    // }, 
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                    // {
                    //     loader: 'file-loader',
                    //     options: {
                    //         name: '[name].[ext]',
                    //         // publicPath: "../images/",
                    //         outputPath: "images/"
                    //     }
                    // },
                    {
                        loader: 'url-loader', // url-loader和file-loader不可同时设置
                        options: {
                            limit: 10000,
                            name: '[name]-[hash:8].[ext]',
                            // publicPath: "../images/",
                            outputPath: "images/"
                        }
                    },
                ]
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'img:data-src', 'audio:src'],
                        minimize: false
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
        // 'jquery$': path.resolve(__dirname, 'src/vendor/jquery-1.8.3.min.js'),
        // 'ccMap$': path.resolve(__dirname, 'node_modules/@ccos/ccmap/dist/index-umd.js')
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name]-[hash].css",
            chunkFilename: "[id].css"
        }),
        new webpack.HotModuleReplacementPlugin(),
        new HTMLWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            // inject: 'head', //脚本注入到头部
            minify: {
                removeComments: true, //去除注释
                collapseWhitespace: false //去掉空格
            }
        }),
        // new CopyWebpackPlugin([
        //     {
        //         from: path.resolve('./src/css'),
        //         to: 'css',
        //         ignore: ['.*']
        //     },
        //     {
        //         from: path.resolve('./src/images'),
        //         to: 'images',
        //         ignore: ['.*']  
        //     },
        //     {
        //         from: path.resolve('./src/js/jquery-1.8.3.min.js'),
        //         to: 'js',
        //         ignore: ['.*']  
        //     }
        // ]),
        new OptimizeCssAssetsPlugin(),
        new webpack.ProvidePlugin({
            ccApp: '@ccos/ccsdk',
            // ccMap: '@ccos/ccmap',
            // ccMap: 'ccMap'
        })
    ]
}