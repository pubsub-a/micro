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

Syntax
------

```javascript
var pubsub = new PubSubA.MicroPubSub();
var channel = pubsub.channel('myChannel');

channel.subscribe('myTopic', function(arg) {
  console.log('received arg: ', arg);
});

channel.publish('myTopic', { foo: 'bar' });

// instead of topics, use object instance or DOM node
var myObject = document.querySelector('#myDomNode');

PubSubA.MicroPubSub.includeIn(myObject);

myObject.subscribe(function(arg) {
  console.log('received arg: ', arg);
});

myObject.publish({ foo: 'bar' });

```

See the [PubSub/A interface proposal][pubsub-interfaces] for in-depth syntax overview.

License
-------
Licensed under MIT license.


  [pubsub-interfaces]: https://github.com/pubsub-a/pubsub-interfaces