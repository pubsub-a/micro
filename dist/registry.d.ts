import { IPubSub } from 'pubsub-a-interfaces';
export declare function addProvider(name: string, ctor: Function): void;
export declare function create(name: string, options?: any): IPubSub;
export declare function getProvider(): never[];
