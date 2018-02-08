const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GoogleFontsPlugin = require("google-fonts-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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

const common = {
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
                exclude: /node_modules\/(?!(@bitwarden)\/).*/
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /.*(fontawesome-webfont)\.svg/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/',
                    }
                }]
            }
        ]
    },
    plugins: [],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'node_modules/@bitwarden/jslib/src')
        }
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    }
};

const renderer = {
    target: 'electron-renderer',
    node: {
        __dirname: false
    },
    entry: {
        'app/main': './src/app/main.ts'
    },
    module: {
        rules: [
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
                        outputPath: 'fonts/',
                        publicPath: '../'
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
        new GoogleFontsPlugin({
            fonts: [
                {
                    family: 'Open Sans',
                    variants: ['300', '300italic', '400', '400italic', '600', '600italic',
                        '700', '700italic', '800', '800italic'],
                    subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext']
                }
            ],
            formats: ['woff2'],
            path: 'fonts/',
            filename: 'css/fonts.css'
        }),
        // ref: https://github.com/angular/angular/issues/20357
        new webpack.ContextReplacementPlugin(
            /\@angular(\\|\/)core(\\|\/)esm5/,
            path.resolve(__dirname, './src')
        ),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'app/vendor',
            chunks: ['app/main'],
            minChunks: isVendorModule
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['app/vendor', 'app/main']
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            include: ['app/main.js']
        }),
        extractCss
    ]
};

module.exports = merge(common, renderer);
