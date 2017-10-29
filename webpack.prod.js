const merge = require('webpack-merge');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const common = require('./webpack.common.js');

const extractLess = new ExtractTextPlugin({
    filename: "popup/css/[name].css",
    disable: false,
    allChunks: true
});

module.exports = merge(common, {
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.less$/,
                use: extractLess.extract({
                    use: [
                        {
                            loader: "css-loader",
                        },
                        {
                            loader: "less-loader",
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        extractLess
        //new UglifyJSPlugin()
    ]
});
