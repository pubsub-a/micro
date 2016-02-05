// var AUTOBAHN_DEBUG = true;

// module PubSubA.Autobahn {
//   declare var autobahn: any;
//   var channelStatic = PubSubA.ChannelStatic;

//   export class AutobahnPubSub implements IPubSub {
//     private serverUrl: string;

//     constructor (options) {
//       if (!options || !options.serverUrl) throw new Error("A serverUrl must be provided");
//       this.serverUrl = options.serverUrl;
//     }

//     start(callback?: IPubSubStartCallback, disconnect?: Function): any {
//       // unfortunately autobahnJS API requires a chanel name for initial
//       // connection whcih we dont have at this point so callback immediately
//       callback(this, undefined, "ok");
//     }
//     stop(callback?: IPubSubStopCallback): any {
//       throw new Error("not implemented yet");
//     }
//     channel(name: string, callback: IChannelReadyCallback): IChannel {
//       var connection = new autobahn.Connection({
//         url: this.serverUrl,
//         realm: 'realm1'
//       });

//       connection.onopen = function(session) {
//         var channel = new AutobahnChannel(session);
//         callback(channel, this);
//       };

//       connection.open();
//     }
//   }

//   class AutobahnChannel extends PubSubA.ChannelStatic implements IChannel {

//     private session: any;
//     private internalChannel : IChannel;

//     public name: string;

//     constructor (session: any) {
//       super();
//       this.session = session;

//       var internalPubSub = PubSubA.create('local');
//       this.internalChannel = <IChannel> internalPubSub.channel('i');
//     }

//     // publish & subscribe are stubs that MUST be implemented by the deriving class
//     publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void {
//       if (callback)
//         throw new Error("passing a callback not yet implemented");

//       // publish to upstream server
//       this.session.publish(topic, [ payload ]);

//       // additionally, relay to internal (=same browser instance) subscribers
//       this.internalChannel.publish(topic, payload);

//       return void 0;
//     }

//     subscribe<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: Function)
//       : ISubscriptionToken {

//       if (callback)
//         throw new Error("passing a callback not yet implemented");

//       var remote_subscription = this.session.subscribe(topic, (args) => {
//         subscription(args[0]);
//       });

//       var internalSubscription = this.internalChannel.subscribe(topic, subscription);

//       var dispose = (cb) => {
//         internalSubscription.dispose();
//         remote_subscription.then(subscription => {
//           this.session.unsubscribe(subscription);
//           invokeIfDefined(cb);
//         });
//         return 0;
//       }
//       return new SubscriptionToken(dispose, internalSubscription.count);
//     }
//   }
// }