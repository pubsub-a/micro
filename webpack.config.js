var path = require('path');
module.exports = {
    target: 'web',
    entry: 'pubsub-micro-webpack.js',
    resolve: {
        root: path.resolve('./dist/src/'),
        extensions: ['', '.json', '.js']
    },
    output:
        {
            path: __dirname + '/dist/',
            filename: 'pubsub-a-micro.js',

            // will be the global variable that the autobahn.js file exports to
            library: 'PubSubMicro',
            libraryTarget: 'umd'
        }
};
