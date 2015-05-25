module PubSubA {

  var provider = [];

  export function addProvider (name: string, ctor: Function) {
    provider[name] = ctor;
  }

  export function create (name: string, options: any) {
    if (!provider[name]) {
      throw new Error('Provider with name: ' + name + ' could not be found, did you forget to include the source?');
    }
    var ctor = provider[name];
    return ctor.call(PubSubA, options);
  }
}
