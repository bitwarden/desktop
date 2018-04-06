const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const isVendorModule = (module) => {
    if (!module.context) {
        return false;
    }

    const nodeModule = module.context.indexOf('node_modules') !== -1;
    const bitwardenModule = module.context.indexOf('@bitwarden') !== -1;
    return nodeModule && !bitwardenModule;
};

const extractCss = new ExtractTextPlugin({
    filename: '[name].css',
    disable: false,
    allChunks: true
});

module.exports = {
    entry: {
        'popup/main': './src/popup2/main.ts',
        'background': './src/background.ts',
        'content/autofill': './src/content/autofill.js',
        'content/autofiller': './src/content/autofiller.js',
        'content/notificationBar': './src/content/notificationBar.js',
        'content/shortcuts': './src/content/shortcuts.js',
        'downloader/downloader': './src/downloader/downloader.ts',
        '2fa/2fa': './src/2fa/2fa.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader'
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.(html)$/,
                loader: 'html-loader'
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                exclude: /loading.svg/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'popup/fonts/',
                        publicPath: './fonts/'
                    }
                }]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /.*(fontawesome-webfont|glyphicons-halflings-regular)\.svg/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'popup/images/',
                        publicPath: './images/'
                    }
                }]
            },
            {
                test: /\.scss$/,
                use: extractCss.extract({
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'sass-loader',
                        }
                    ],
                    publicPath: '../'
                })
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'build2/*')
        ]),
        new AngularCompilerPlugin({
            tsConfigPath: 'tsconfig.json',
            entryModule: 'src/popup2/app.module#AppModule',
            sourceMap: true
        }),
        // ref: https://github.com/angular/angular/issues/20357
        new webpack.ContextReplacementPlugin(
            /\@angular(\\|\/)core(\\|\/)esm5/,
            path.resolve(__dirname, './src')
        ),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'popup/vendor',
            chunks: ['popup/main'],
            minChunks: isVendorModule
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['background'],
            minChunks: isVendorModule
        }),
        new HtmlWebpackPlugin({
            template: './src/popup2/index.html',
            filename: 'popup/index.html',
            chunks: ['popup/vendor', 'popup/main']
        }),
        new HtmlWebpackPlugin({
            template: './src/background.html',
            filename: 'background.html',
            chunks: ['vendor', 'background']
        }),
        new HtmlWebpackPlugin({
            template: './src/downloader/index.html',
            filename: 'downloader/index.html',
            chunks: ['downloader/downloader']
        }),
        new HtmlWebpackPlugin({
            template: './src/2fa/index.html',
            filename: '2fa/index.html',
            chunks: ['2fa/2fa']
        }),
        new CopyWebpackPlugin([
            './src/manifest.json',
            { from: './src/_locales', to: '_locales' },
            { from: './src/edge', to: 'edge' },
            { from: './src/safari', to: 'safari' },
            { from: './src/images', to: 'images' },
            { from: './src/content/autofill.css', to: 'content' }
        ]),
        //new webpack.SourceMapDevToolPlugin({
        //    filename: '[name].js.map',
        //    include: ['popup/main.js', 'background.js']
        //}),
        extractCss
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
        },
        symlinks: false,
        modules: [path.resolve('node_modules')]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build2')
    }
};
