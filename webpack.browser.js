const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const common = {
    module: {
        rules: [
            // {
            //     test: /\.ts$/,
            //     enforce: 'pre',
            //     loader: 'tslint-loader',
            // },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack',
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /.*(fontawesome-webfont)\.svg/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/',
                    },
                }],
            },
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules(\/|\\)(?!(cozy-ui))/,
                options: {
                    cacheDirectory: 'node_modules/.cache/babel-loader/react',
                    presets: ['cozy-app'],
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                './src/package.json',
                { from: './src/images', to: 'images' },
                { from: './src/app/browser/tools', to: 'tools' },
                { from: './src/locales', to: 'locales' },
                {from: './src/images/icon.svg'},
                {from: './src/images/favicon.ico'},
                {from: './stores/cozy/screenshots', to: 'screenshots'},
                './manifest.webapp',
            ]
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': process.env.DEVELOPMENT === '1'
                ? JSON.stringify('development')
                : JSON.stringify('production'),
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            'electron'                                                     : path.resolve(__dirname, 'src/app/browser/mock-electron'),
            'jslib/electron/services/electronRendererMessaging.service'    : path.resolve(__dirname, 'src/app/browser/browserMessaging.service'),
            'jslib/electron/services/electronRendererSecureStorage.service': path.resolve(__dirname, 'src/app/browser/browserStorage.service'),
            'jslib/electron/services/electronStorage.service'              : path.resolve(__dirname, 'src/app/browser/browserStorage.service'),
            'jslib/electron/services/electronRendererStorage.service'      : path.resolve(__dirname, 'src/app/browser/browserStorage.service'),
            'jslib/electron/services/electronLog.service'                  : path.resolve(__dirname, 'src/app/browser/consoleLog.service'),
            'jslib/electron/services/electronPlatformUtils.service'        : path.resolve(__dirname, 'src/app/browser/browserPlatformUtils.service'),
            'jslib/electron/utils'                                         : path.resolve(__dirname, 'src/app/browser/utils'),
            'browser/functionForTarget._showDialog'                        : path.resolve(__dirname, 'src/app/browser/functionForTarget._showDialog.browser'),
            '../services/nativeMessaging.service'                          : path.resolve(__dirname, 'src/app/browser/mock-nativeMessagingService'),
            '../services/i18n.service'                                     : path.resolve(__dirname, 'src/app/browser/i18n.service'),
            // many aliases are required in order to take into account all the import of this abstraction from the jslib
            'jslib/abstractions/platformUtils.service'                     : path.resolve(__dirname, 'src/app/browser/platformUtils.service.abstraction'),
            'jslib/src/abstractions/platformUtils.service'                 : path.resolve(__dirname, 'src/app/browser/platformUtils.service.abstraction'),
            '../abstractions/platformUtils.service'                        : path.resolve(__dirname, 'src/app/browser/platformUtils.service.abstraction'),
            '../../abstractions/platformUtils.service'                     : path.resolve(__dirname, 'src/app/browser/platformUtils.service.abstraction'),
            '../../../abstractions/platformUtils.service'                  : path.resolve(__dirname, 'src/app/browser/platformUtils.service.abstraction'),
            jslib: path.join(__dirname, 'jslib/src'),
            cozy: path.join(__dirname, 'src/cozy')
        },
        symlinks: false,
        modules: [path.resolve('node_modules')],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build-browser'),
    },
};

const renderer = {
    mode: process.env.DEVELOPMENT === '1' ? 'development' : 'production',
    devtool: false,
    target: 'web',
    node: {
        __dirname: false,
    },
    entry: {
        'app/main': './src/app/main.ts',
    },
    optimization: {
        minimize: process.env.DEVELOPMENT === '1' ? false : true,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'app/vendor',
                    chunks: (chunk) => {
                        return chunk.name === 'app/main';
                    },
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                loader: 'html-loader',
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                exclude: /loading.svg|icons-16-cozy-sync.svg|[\\/]cozy\/react\/assets[\\/]/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                    },
                }],
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        },
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            // Hide System.import warnings. ref: https://github.com/angular/angular/issues/21560
            {
                test: /[\/\\]@angular[\/\\].+\.js$/,
                parser: { system: true },
            },
        ],
    },
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: './tsconfig-browser.json',
            entryModule: 'src/app/app.module#AppModule',
            sourceMap: true,
        }),
        // ref: https://github.com/angular/angular/issues/20357
        new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)fesm5/,
            path.resolve(__dirname, './src')),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['app/vendor', 'app/main'],
        }),
        new webpack.SourceMapDevToolPlugin({
            include: ['app/main.js'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
            // url: false,
        }),
    ],
    devServer: {
        port: 4242,
    },
};

if (process.env.BUNDLE_ANALYSE) {
    renderer.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = merge(common, renderer);
