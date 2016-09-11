const webpack = require('webpack');
const path = require('path');

const PATHS = {
    app: path.resolve(__dirname, 'src/js'),
    styles: path.resolve(__dirname, 'src/styles'),
    build: path.resolve(__dirname, 'build')
};

module.exports = {
    entry: {
        app: path.resolve(PATHS.app, 'app.js'),
        vendor: ['react']
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss']
    },
    module: {
        noParse: /\.min\.js$/,
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel?cacheDirectory'],
                include: PATHS.app
            }
        ]
    },
    output: {
        path: PATHS.build,
        filename: 'js/[name].js',
        publicPath: '/'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'src'),
        port: 8082,
        historyApiFallback: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                secure: false
            },
            '/socket.io': {
                target: 'http://localhost:3000',
                secure: false
            }
        }
    },
    devtool: 'source-map'
};