const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const common = {
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules\/(?!(@bitwarden)\/).*/,
            },
        ],
    },
    plugins: [],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
            tldjs: path.join(__dirname, 'jslib/src/misc/tldjs.noop'),
        },
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
    },
};

const main = {
    mode: 'production',
    target: 'electron-main',
    node: {
        __dirname: false,
        __filename: false,
    },
    entry: {
        'main': './src/main.ts',
    },
    optimization: {
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: 'node-loader',
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'build/*'),
        ]),
        new CopyWebpackPlugin([
            './src/package.json',
            { from: './src/images', to: 'images' },
            { from: './src/locales', to: 'locales' },
        ]),
    ],
    externals: [nodeExternals()],
};

module.exports = merge(common, main);
