import path from "path";
import webpack from 'webpack';
import dotenv from 'dotenv';

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
                loader: 'babel-loader',
                query: {
                    presets: ['react','es2015']
                }
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
            'window.jQuery': 'jquery',
            moment: 'moment'
        }),
        new webpack.DefinePlugin({
          'process.env': {
            'WISHLIST_CLIENT_ID': `'${process.env.WISHLIST_CLIENT_ID}'`,
            'WISHLIST_CLIENT_SECRET': `'${process.env.WISHLIST_CLIENT_SECRET}'`,
            'WISHLIST_REDIRECT_URI': `'${process.env.WISHLIST_REDIRECT_URI}'`,
            'WISHLIST_BASE_URI': `'${process.env.WISHLIST_BASE_URI}'`
          }
        })
    ]
};
