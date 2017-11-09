const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const extractLess = new ExtractTextPlugin({
    filename: 'popup/css/[name].css',
    disable: false,
    allChunks: true
});

module.exports = merge(common, {
    module: {
        rules: [
            {
                test: /\.less$/,
                use: extractLess.extract({
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'less-loader',
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        // UglifyJS does not support es6
        // ref: https://github.com/webpack/webpack/issues/2972#issuecomment-261705632
        //new UglifyJSPlugin({
        //    uglifyOptions: {
        //        mangle: false
        //    }
        //}),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            include: ['background.js', 'popup/app.js']
        }),
        extractLess
    ]
});
