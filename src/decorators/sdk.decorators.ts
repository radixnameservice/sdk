import { errorStack } from '../utils/response.utils';

import { ErrorI } from '../common/response.types';
import { ParamProcessMapT } from '../common/validation.types';

export function requireDependencies(mode: 'read-only' | 'full') {
    return function (
        _target: any,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {

            // Ensure dependencies are loaded.
            await this.fetchDependencies();

            // Check that the SDK has been initialized properly.
            this.checkInitialized();

            // For 'full' mode, ensure RDT exists.
            if (mode === 'full' && !this.rdt) {
                throw new Error(
                    "RNS SDK: RDT instance is required for this operation, but it wasn't provided within the constructor."
                );
            }

            // Execute the original method.
            return originalMethod.apply(this, args);

        };
        return descriptor;
    };
}

export function ProcessParameters(mapping: ParamProcessMapT) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        return class extends constructor {

            constructor(...args: any[]) {

                super(...args);
                const methodNames = Object.getOwnPropertyNames(constructor.prototype);

                for (const methodName of methodNames) {
                    if (methodName === 'constructor') continue;
                    const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, methodName);
                    if (!descriptor) continue;

                    if (typeof descriptor.value === 'function') {
                        const originalMethod = descriptor.value;
                        descriptor.value = async function (...methodArgs: any[]) {
                            // We assume the method takes a single object as its first argument.
                            if (methodArgs.length && typeof methodArgs[0] === 'object') {
                                const argObj = methodArgs[0];
                                const validationErrors: ErrorI[] = [];

                                for (const key in mapping) {
                                    const config = mapping[key];

                                    if (Object.prototype.hasOwnProperty.call(argObj, key)) {

                                        // Normalize the value if a normalization function is provided.
                                        if (config.normalize) {
                                            const normalizedValue = config.normalize(argObj[key]);
                                            argObj[key] = normalizedValue;
                                        }

                                        // Validate the value if a validation function is provided.
                                        if (config.validate) {
                                            const result = config.validate(argObj[key]);
                                            if (result !== true) {
                                                validationErrors.push(result);
                                            }
                                        }
                                    }
                                }

                                if (validationErrors.length > 0) {
                                    return errorStack(validationErrors);
                                }
                            }
                            return originalMethod.apply(this, methodArgs);
                        };

                        Object.defineProperty(constructor.prototype, methodName, descriptor);
                    }
                }

            }

        };
    };
}