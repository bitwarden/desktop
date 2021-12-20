const path = require("path");
const { merge } = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;

const common = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "tslint-loader",
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules\/(?!(@bitwarden)\/).*/,
      },
    ],
  },
  plugins: [],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
  },
};

const prod = {
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
};

const dev = {
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
  devtool: "cheap-source-map",
};

const main = {
  mode: NODE_ENV,
  target: "electron-main",
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: {
    main: "./src/entry.ts",
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        "./src/package.json",
        { from: "./src/images", to: "images" },
        { from: "./src/locales", to: "locales" },
      ],
    }),
  ],
  externals: [nodeExternals()],
};

module.exports = merge(common, NODE_ENV === "development" ? dev : prod, main);
