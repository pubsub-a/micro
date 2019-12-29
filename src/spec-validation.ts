import { PubSubMicro } from "./pubsub";
import { DefaultValidator, ValidationOptions } from "./string-validation";

/**
 *  Code required so that we can run in the spec validation test suite that comes with the pubsub-a-interface
 *  project (not to be confused with our own unit tests in the spec/ folder).
 */

function getValidatedInstance(linkedInstance?: PubSubMicro, validationOptions?: ValidationOptions) {
    const validator = new DefaultValidator(validationOptions);
    return new PubSubMicro(linkedInstance, validator);
}

const getPubSubImplementation = function(options?: any) {
    return new PubSubMicro();
};

const getLinkedPubSubImplementation = function(numInstances: number, options: any) {
    if (!numInstances) {
        numInstances = 2;
    }

    let instance: PubSubMicro;
    if (options && options.validationOptions) instance = getValidatedInstance(undefined, options.validationOptions);
    else instance = new PubSubMicro();

    const instances: Array<any> = [];

    while (numInstances-- > 0) {
        if (options && options.validationOptions)
            instances.push(getValidatedInstance(undefined, options.validationOptions));
        else instances.push(new PubSubMicro(instance));
    }

    return instances;
};

const name = "PubSubMicro";

export { getPubSubImplementation, getLinkedPubSubImplementation, name };
