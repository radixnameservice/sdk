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
                const prototype = Object.getPrototypeOf(this);

                for (const key of Object.getOwnPropertyNames(prototype)) {
                    if (key === 'constructor') continue;
                    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
                    if (!descriptor) continue;

                    if (typeof descriptor.value === 'function') {
                        const originalMethod = descriptor.value;
                        descriptor.value = async function (...methodArgs: any[]) {

                            if (methodArgs.length && typeof methodArgs[0] === 'object') {
                                const argObj = methodArgs[0];
                                const validationErrors: ErrorI[] = [];

                                for (const prop in mapping) {
                                    const config = mapping[prop];
                                    if (Object.prototype.hasOwnProperty.call(argObj, prop)) {

                                        // Normalize if a function is provided
                                        if (config.normalize) {
                                            argObj[prop] = config.normalize(argObj[prop]);
                                        }

                                        // Validate if a function is provided
                                        if (config.validate) {
                                            const result = config.validate(argObj[prop]);
                                            if (!result.valid) {

                                                // If the parameter is missing (falsy) use missingError, otherwise use invalidError
                                                if (!argObj[prop] && config.missingError) {
                                                    validationErrors.push(config.missingError(argObj[prop]));
                                                } else if (config.invalidError) {
                                                    validationErrors.push(config.invalidError(argObj[prop], result.message));
                                                } else {
                                                    validationErrors.push({
                                                        code: 'GENERIC_VALIDATION_ERROR',
                                                        error: `Invalid ${prop}`,
                                                        verbose: result.message || null,
                                                    });
                                                }
                                            }
                                        }

                                    } else {

                                        // If the parameter is missing entirely from the object
                                        if (config.missingError) {
                                            validationErrors.push(config.missingError(undefined));
                                        }

                                    }
                                }

                                if (validationErrors.length > 0) {
                                    return errorStack(validationErrors);
                                }
                            }
                            return originalMethod.apply(this, methodArgs);
                        };
                        
                        Object.defineProperty(prototype, key, descriptor);
                    }
                }
            }
        };
    };

}