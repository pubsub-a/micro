var path = require('path');
module.exports = {
    target: 'web',
    entry: 'pubsub-micro.js',
    resolve: {
        root: path.resolve('./dist/'),
        extensions: ['', '.json', '.js']
    },
    output: {
        path: __dirname + '/dist/bundle/',
        filename: 'pubsub-a-micro.umd.js',

        // will be the global variable that the autobahn.js file exports to
        library: 'PubSubMicro',
        libraryTarget: 'umd'
    },
    preLoaders: [
        {
            test: /\.js$/,
            loader: "source-map-loader"
        }
    ]
};
