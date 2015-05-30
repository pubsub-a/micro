module PubSubA {

  var provider = [];

  export function addProvider (name: string, ctor: Function) {
    provider[name] = ctor;
  }

  export function create (name: string, options?: any): IPubSub {
    if (!provider[name]) {
      throw new Error('Provider with name: ' + name + ' could not be found, did you forget to include the source?');
    }
    var ctor = provider[name];
    return <IPubSub> ctor.call(PubSubA, options);
  }

  // register MicroPubSub immediately
  // HACK this relys on the compile order of typescript, find a better way to execute after
  // both registry and MicroPubSub are declared
  // TODO should we return the same instance, always?
  (function() {
    PubSubA.addProvider('local', function() { return new PubSubA.MicroPubSub(); });
  }());

}
