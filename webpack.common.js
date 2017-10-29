const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'dist')
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'Q': 'q'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'popup/vendor',
            chunks: ['popup/app'],
            minChunks: function (module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/popup/index.html',
            filename: 'popup/index.html',
            chunks: ['popup/vendor', 'popup/app', 'fonts']
        }),
        new HtmlWebpackPlugin({
            template: './src/background.html',
            filename: 'background.html',
            chunks: ['background']
        }),
        new HtmlWebpackPlugin({
            template: './src/notification/bar.html',
            filename: 'notification/bar.html',
            chunks: ['notification/bar']
        }),
        new CopyWebpackPlugin([
            // Temporarily copy the whole app folder, can be removed once
            // the templates uses template rather than using templateUrl.
            {
                context: 'src/popup/app',
                from: '**/*.html',
                to: 'popup/app'
            },
            './src/manifest.json',
            { from: './src/_locales', to: '_locales' },
            { from: './src/edge', to: 'edge' },
            { from: './src/images', to: 'images' },
            { from: './src/lib', to: 'lib' },
            { from: './src/models', to: 'models' },
            { from: './src/overlay', to: 'overlay' },
            { from: './src/scripts', to: 'scripts' },
            { from: './src/services', to: 'services' },
            './src/background.js'
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
