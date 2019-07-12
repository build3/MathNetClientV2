const paths         = require('./paths.js');

const path          = require('path');
const webpackMerge  = require('webpack-merge');
const baseConfig    = require('./webpack.base.js');
const BundleTracker = require('webpack-bundle-tracker');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = webpackMerge(baseConfig, {
    watch: true,
    output: {
        path: path.resolve(__dirname, paths.baseOutputDir),
        filename: '[name].[chunkhash].js'
    },
    devServer: {
        clientLogLevel: 'warning',
        compress: true,
        contentBase: path.resolve(__dirname, paths.baseOutputDir),
        host: 'localhost',
        open: false,
        port: 9000,
    },
    plugins: [
        new WebpackAssetsManifest({
            output: path.resolve() + '/webpack-stats.local.json'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        }),
    ]
});
