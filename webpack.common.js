const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isVendorModule = (module) => {
    if (!module.context) {
        return false;
    }

    const nodeModule = module.context.indexOf('node_modules') !== -1;
    const bitwardenModule = module.context.indexOf('@bitwarden') !== -1;
    return nodeModule && !bitwardenModule;
};

module.exports = {
    devServer: {
        contentBase: './src',
        historyApiFallback: true,
        quiet: true,
        stats: 'minimal'
    },
    entry: {
        'app': './src/main.ts'
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
                exclude: /node_modules\/(?!(@bitwarden)\/).*/
            },
            {
                test: /\.(html)$/,
                loader: 'html-loader'
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'build/*')
        ]),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['app'],
            minChunks: isVendorModule
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: ['vendor', 'app']
        }),
        new CopyWebpackPlugin([

        ])
    ],
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
