import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';
import OfflinePlugin from 'offline-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

dotenv.load();

export default {
    entry: [
      path.resolve(__dirname, 'app/main.js')
    ],
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'bundle.js',
    },
    resolve: {
        alias: {
            jQuery: `${path.resolve('.')}/node_modules/jquery/dist/jquery.min.js`
        },
        modulesDirectories: ['node_modules', 'app/components', 'app']
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            },
            {
                test: /\.s?css$/,
                loader: 'style!css!sass'
            },
            {
                test: /\.(png|woff|woff2|ttf|eot|svg)$/,
                loader: 'file-loader'
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new HtmlWebpackPlugin({
            title: 'Live Train Times',
            template: path.resolve(__dirname, 'app/index.html'),
            favicon: path.resolve(__dirname, 'app/assets/favicon.ico')
        }),
        new OfflinePlugin({
            caches: 'all',
            scope: '/',
            updateStrategy: 'all',
            AppCache: false,
            version: 'v1',
            ServiceWorker: {
                output: 'sw.js'
            }
        })
    ]
};
