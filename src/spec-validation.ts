import { PubSubMicro } from "./pubsub";
import { DefaultValidator, ValidationOptions } from "./string-validation";
import { PubSubMicroUnvalidated } from "./pubsub-micro";
import { addValidation } from "./validation-wrapper";

/**
 *  Code required so that we can run in the spec validation test suite that comes with the pubsub-a-interface
 *  project (not to be confused with our own unit tests in the spec/ folder).
 */

function getValidatedInstance(validationOptions: ValidationOptions) {
    return addValidation(PubSubMicroUnvalidated, new DefaultValidator(validationOptions))
}

const getPubSubImplementation = function (options?: any) {
    return new PubSubMicro();
};

const getLinkedPubSubImplementation = function (numInstances: number, options: any) {
    let PubSubCtor: any = PubSubMicro;
    if (options && options.validationOptions)
        PubSubCtor = getValidatedInstance(options.validationOptions)

    if (!numInstances) {
        numInstances = 2;
    }

    let instance = new PubSubCtor();

    const instances: Array<any> = [];

    while (numInstances-- > 0) {
        instances.push(new PubSubCtor(instance));
    }

    return instances;
};

const name = "PubSubMicro";

export {
    getPubSubImplementation,
    getLinkedPubSubImplementation,
    name,
}