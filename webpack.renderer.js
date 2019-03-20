const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const AngularCompilerPlugin = require("@ngtools/webpack").AngularCompilerPlugin;

const extractCss = new ExtractTextPlugin({
    filename: "[name].css",
    disable: false,
    allChunks: true
});

const common = {
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: "pre",
                loader: "tslint-loader"
            },
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: "@ngtools/webpack"
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /.*(fontawesome-webfont)\.svg/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "images/"
                        }
                    }
                ]
            }
        ]
    },
    plugins: [],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            jslib: path.join(__dirname, "jslib/src")
        },
        symlinks: false,
        modules: [path.resolve("node_modules")]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "build")
    }
};

const renderer = {
    mode: "production",
    target: "electron-renderer",
    node: {
        __dirname: false
    },
    entry: {
        "app/main": "./src/app/main.ts"
    },
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "app/vendor",
                    chunks: chunk => {
                        return chunk.name === "app/main";
                    }
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                loader: "html-loader"
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                exclude: /loading.svg/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "fonts/"
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: extractCss.extract({
                    use: [
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader"
                        }
                    ],
                    publicPath: "../"
                })
            },
            // Hide System.import warnings. ref: https://github.com/angular/angular/issues/21560
            {
                test: /[\/\\]@angular[\/\\].+\.js$/,
                parser: { system: true }
            }
        ]
    },
    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: "tsconfig.json",
            entryModule: "src/app/app.module#AppModule",
            sourceMap: true
        }),
        // ref: https://github.com/angular/angular/issues/20357
        new webpack.ContextReplacementPlugin(
            /\@angular(\\|\/)core(\\|\/)fesm5/,
            path.resolve(__dirname, "./src")
        ),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
            chunks: ["app/vendor", "app/main"]
        }),
        new HtmlWebpackPlugin({
            template: "./src/hotwindow.html",
            filename: "hotwindow.html",
            chunks: ["app/vendor", "app/main"]
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: "[name].js.map",
            include: ["app/main.js"]
        }),
        extractCss
    ]
};

module.exports = merge(common, renderer);
