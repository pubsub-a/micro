import {
    PubSub,
    Channel as IChannel,
    SubscriptionToken,
    ObserverFunc,
} from '@dynalon/pubsub-a-interfaces';
import { NameValidator, DefaultValidator } from "./string-validation";

function objectIsPlainObject(obj: any): boolean {
    // TODO recursive checking, all corner cases etc.
    // Use this poor-mans approach for now
    if (typeof obj == 'object' && obj.constructor != Object) {
        return false;
    } else {
        return true;
    }
}

export type Constructor<T> = {
    new(...args: any[]): T
}

export function addValidation<P extends PubSub>(UnvalidatedPubSub: Constructor<P>, validator?: NameValidator) {
    return new Proxy(UnvalidatedPubSub, {
        construct(target, args) {
            let unvalidatedPubSubInstance = new target(...args);
            return new Proxy(unvalidatedPubSubInstance, new PubSubValidationProxy(validator))
        }
    })
}

export class PubSubValidationProxy {
    private _stringValidator: NameValidator;

    constructor(validator?: NameValidator) {
        if (validator) {
            this._stringValidator = validator;
        } else {
            this._stringValidator = new DefaultValidator();
        }
    }

    get(obj: PubSub, prop: keyof PubSub) {
        if (prop === "channel") {
            return this.channel.bind(this, obj);
        } else if (prop === "start") {
            return this.start.bind(this, obj);
        } else {
            return obj[prop];
        }
    }

    private channel(originalPubSub: PubSub, name: string): Promise<IChannel> {
        if (originalPubSub.isStopped) {
            const err = "Instance is stopped";
            return Promise.reject(new Error(err));
        }
        if (typeof name !== "string")
            throw new Error("Channel name must be of type string");
        if (name.length === 0)
            throw new Error(`Channel name must be non-zerolength string`);

        // TODO if validation fails, reject the promise?
        this._stringValidator.validateChannelName(name);

        // VALIDATION PASSED...

        return originalPubSub.channel(name).then(chan => {
            return new Proxy(chan, new ChannelProxy(this._stringValidator))
        });
    }

    private start(originalPubSub: PubSub, name: string): Promise<PubSub> {
        if (originalPubSub.isStopped) {
            throw new Error("start() called after and instance was stoped");
        } else {
            return originalPubSub.start();
        }
    }
}

export class ChannelProxy {

    constructor(private _stringValidator: NameValidator, private enablePlainObjectCheck = true) {
    }

    get(obj: IChannel, prop: keyof IChannel) {

        if (prop === "publish") {
            return this.publish.bind(this, obj);
        } else if (prop === "subscribe") {
            return this.subscribe.bind(this, obj);
        } else if (prop === "once") {
            return this.once.bind(this, obj);
        } else {
            return obj[prop];
        }
    }

    private publish<T>(originalChannel: IChannel, topic: string, payload: T): Promise<T> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)

        if (this.enablePlainObjectCheck && !objectIsPlainObject(payload)) {
            throw new Error("only plain objects are allowed to be published");
        }

        if (originalChannel.pubsub.isStopped) {
            const err = new Error(`publish after pubsub instance has stopped, encountered when publishing on topic: ${topic}`);
            return Promise.reject(err);
        }

        this._stringValidator.validateTopicName(topic);

        return originalChannel.publish(topic, payload);
    }

    private subscribe<T>(originalChannel: IChannel, topic: string, observer: ObserverFunc<T>): Promise<SubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error(`topic must be a non-zerolength string, was: ${topic}`)
        this._stringValidator.validateTopicName(topic);

        if (originalChannel.pubsub.isStopped) {
            const err = new Error(`subscribe after pubsub instance has stopped, topic was: ${topic}`);
            return Promise.reject(err);
        }

        return originalChannel.subscribe(topic, observer);
    }

    private once<T>(originalChannel: IChannel, topic: string, observer: ObserverFunc<any>): Promise<SubscriptionToken> {
        if (typeof topic !== 'string' || topic == "")
            throw new Error("topic must be a non-zerolength string")
        this._stringValidator.validateTopicName(topic);

        return originalChannel.once(topic, observer);
    }
}
