import { IPubSub } from 'pubsub-a-interfaces';

var provider = [];

export function addProvider(name: string, ctor: Function) {
    provider[name] = ctor;
}

export function create(name: string, options?: any): IPubSub {
    if (!provider[name]) {
        throw new Error('Provider with name: ' + name + ' could not be found, did you forget to include the source?');
    }
    var ctor = provider[name];
    // TODO whats this?
    return <IPubSub>ctor.call(ctor, options);
}

export function getProvider() {
    return provider;
}
