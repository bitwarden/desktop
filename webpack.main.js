const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

const common = {
    module: {
        rules: [
            // {
            //     test: /\.ts$/,
            //     enforce: 'pre',
            //     loader: 'tslint-loader',
            // },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules\/(?!(@bitwarden)\/).*/,
                // exclude: [/node_modules\/(?!(@bitwarden)\/).*/, /src\/app/],
            },
        ],
    },
    plugins: [
        // new webpack.EnvironmentPlugin(['ELECTRON_IS_DEV', 'ENV', 'MODE']),
        // new webpack.DefinePlugin({
        //     IS_WEB_APP: true,
        // }),
        new webpack.EnvironmentPlugin({
            ELECTRON_IS_DEV: '0',        // defaults to '0' if no process.env.ELECTRON_IS_DEV is set
            ENV            : '',         // defaults to '' if no process.env.ENV is set
            TARGET         : 'electron', // <electron|web-app> defaults to 'electron' if no process.env.MODE is set
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
            tldjs: path.join(__dirname, 'jslib/src/misc/tldjs.noop'),
            'browser/functionForTarget._showDialog': path.resolve(__dirname, 'src/app/browser/functionForTarget._showDialog.electron'),
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
