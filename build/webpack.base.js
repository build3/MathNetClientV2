"use strict";

const path = require('path');
const paths = require('./paths.js');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
    target: 'web',
    externals: {},
    context: paths.baseInputDir,
    entry: {
        app: './app.js',
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$|\.vue$/,
                exclude: /node_modules|scripts/,
                loader: 'eslint-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            minimize: {
                                safe: true
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {}
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                loader: 'file-loader?name=assets/images/[name].[hash].[ext]'
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assets/fonts',
                    publicPath: 'assets/fonts/'
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': resolve('src')
        }
    },

    plugins: [
        // Let's don't transform the output folder into Kicior's mansion.
        new CleanWebpackPlugin({
            verbose: true,
            protectWebpackAssets: true,
            cleanAfterEveryBuildPatterns: ['!vendor/**/*']
        }),
        // Parse .vue files.
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].css"
        }),
        // Provide basic 3d-party plugins.
        // Comment unneeded.
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            jquery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        // Simple copy raw resources from app/assets/vendor directory to
        // static/[target]/vendor directory (without change).
        new CopyWebpackPlugin([
            {from: './vendor/**/*', to: ''}
        ])
    ],
    optimization: {
        // Extract shared runtime code.
        runtimeChunk: 'single',
        namedModules: true,
        noEmitOnErrors: true
    }
}
