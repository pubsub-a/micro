PubSub/A Reference Implementation
=================================

This is the reference implementation of the [PubSub/A interface proposal][pubsub-interfaces]. The
implementation is written in TypeScript but can be consumed from any JavaScript code.

While PubSub/A is designed to work over the network, this reference implementation only works
locally. Subscriptions are only share among the same instance of the PubSubMicro instance.

Building and Installation
-------------------------

1. Checkout this repo.
1. `npm install`
1. `npm run build`
1. Find source in the `dist` folder
1. Run tests: `npm run test` (optional)

npm/bower packages not yet available :(

Usage
-----

The `pubsub-a-micro.umd.js` file in the `dist/bundle` folder is compiled as UMD module. You can `require()` it from your CommonJS or AMD setup, or include in the browser and access it via the `PubSubMicro` global variable.

Syntax
------

```javascript
// when using as a global variable by including via <script></script> tag
var PubSub = new PubSubMicro.PubSub();
//
// alternatively using CommonJS/AMD:
// var PubSub = require('pubsub-a-micro').PubSub;
//
var pubsub = new PubSub();
pubsub.start(function() {
    pubsub.channel('myChannel', function(chan) {
        // channels are initialize asynchronously, hence the callback

        chan.subscribe('myTopic', function(arg) {
          console.log('received arg: ', arg);
        });

        chan.publish('myTopic', { foo: 'bar' });
    });
});

// Instead of callback, you can use promises (requires ES6 promises or shim)
pubsub.start()
    .then(function() {
        return pubsub.channel('myChannel');
    }).then(function(channel) {
        channel.subscribe('myTopic', function(arg) {
            console.log('received arg: ', arg);
        });
        channel.publish('myTopic', { foo: 'bar' });
    });
});
```

See the [PubSub/A interface definition][pubsub-interfaces] for in-depth syntax overview.

  [pubsub-interfaces]: https://github.com/pubsub-a/pubsub-interfaces
