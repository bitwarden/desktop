const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isVendorModule = (module) => {
    // returns true for everything in node_modules
    return module.context && module.context.indexOf('node_modules') !== -1;
};

module.exports = {
    entry: {
        'popup/app': './src/popup/app/app.js',
        'background': './src/background.js',
        'content/autofill': './src/content/autofill.js',
        'content/autofiller': './src/content/autofiller.js',
        'content/notificationBar': './src/content/notificationBar.js',
        'notification/bar': './src/notification/bar.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader'
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(html)$/,
                loader: 'html-loader'
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'popup/fonts/',
                        publicPath: '/'
                    }
                }]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        useRelativePath: true
                    }
                }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'dist/*')
        ]),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'popup/vendor',
            chunks: ['popup/app'],
            minChunks: isVendorModule
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['background'],
            minChunks: isVendorModule
        }),
        new HtmlWebpackPlugin({
            template: './src/popup/index.html',
            filename: 'popup/index.html',
            chunks: ['popup/vendor', 'popup/app', 'fonts']
        }),
        new HtmlWebpackPlugin({
            template: './src/background.html',
            filename: 'background.html',
            chunks: ['vendor', 'background']
        }),
        new HtmlWebpackPlugin({
            template: './src/notification/bar.html',
            filename: 'notification/bar.html',
            chunks: ['notification/bar']
        }),
        new CopyWebpackPlugin([
            './src/manifest.json',
            { from: './src/_locales', to: '_locales' },
            { from: './src/edge', to: 'edge' },
            { from: './src/images', to: 'images' },
            { from: './src/content/autofill.css', to: 'content' }
        ])
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};
