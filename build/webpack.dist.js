
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const BundleTracker = require('webpack-bundle-tracker');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base.js');
const paths = require('./paths.js');


module.exports = webpackMerge(baseConfig, {
    output: {
        path: path.resolve(__dirname, paths.baseOutputDir),
        filename: '[name].[chunkhash].js',
    },
    plugins: [
        new WebpackAssetsManifest({
            output: `${path.resolve()}/webpack-stats.dist.json`,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
        }),
    ],
});
