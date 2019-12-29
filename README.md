PubSub/A Reference Implementation
=================================

This is the reference implementation of the [PubSub/A interface proposal][pubsub-interfaces]. The
implementation is written in TypeScript but can be consumed from any JavaScript code.

While PubSub/A is designed to work over the network, this reference implementation only works
locally. Subscriptions are only share among the same instance of the PubSubMicro instance.


```javascript
import { PubSubMicro as PubSub } from "@pubsub-a/micro"

const pubsub = new PubSub();
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

  [pubsub-interfaces]: https://github.com/pubsub-a/interfaces
