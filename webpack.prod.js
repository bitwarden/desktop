const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            include: ['background.js', 'popup/app.js']
        }),
        extractLess
    ]
});
