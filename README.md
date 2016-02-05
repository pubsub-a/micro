PubSub/A Reference Implementation
=================================

This is the reference implementation of the [PubSub/A interface proposal][pubsub-interfaces]. The
implementation is written in TypeScript but can be consumed from any JavaScript code.

Building and Installation
-------------------------

1. Checkout this repo.
1. `npm install`
1. `gulp`
1. Find source in the `dist` folder

npm/bower packages not yet available :(

Usage
-----

The `pubsub-a-micro.js` file in the `dist` folder is compiled as UMD module. You can `require()` it from your CommonJS or AMD setup, or include in the browser and access it via the `PubSubMicro` global variable.

Syntax
------

```javascript
// when using as a global variable
var pubsub = new PubSubMicro();
//
// alternatively using CommonJS/AMD:
// var pubsub = require('pubsub-a-micro');

var channel = pubsub.channel('myChannel');

channel.subscribe('myTopic', function(arg) {
  console.log('received arg: ', arg);
});

channel.publish('myTopic', { foo: 'bar' });

// instead of topics, use object instance or DOM node
var myObject = document.querySelector('#myDomNode');

PubSubMicro.includeIn(myObject);

myObject.subscribe(function(arg) {
  console.log('received arg: ', arg);
});

myObject.publish({ foo: 'bar' });

// you can rename the publish/subscribe functions to anything:
var otherObject = {};
PubSubMicro.includeIn(otherObject, 'myPublish', 'mySubscribe');
otherObject.myPublish('Hello world!');


```

See the [PubSub/A interface proposal][pubsub-interfaces] for in-depth syntax overview.

License
-------
Licensed under MIT license.


  [pubsub-interfaces]: https://github.com/pubsub-a/pubsub-interfaces