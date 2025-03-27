import { errorStack, wrapResponse } from '../utils/response.utils';

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

export function ProcessParameters(methodGuardMap: ParamProcessMapT) {
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

                                // Merge the default mapping with any method-specific override.
                                const defaultMapping = methodGuardMap._default || {};
                                const methodSpecificMapping = methodGuardMap[methodName] || {};
                                const mergedMapping = { ...defaultMapping, ...methodSpecificMapping };

                                for (const key in mergedMapping) {
                                    const config = mergedMapping[key];

                                    if (Object.prototype.hasOwnProperty.call(argObj, key)) {

                                        // Normalize the value if a normalization function is provided.
                                        if (config.normalize) {
                                            const normalizedValue = await config.normalize(argObj[key], this);
                                            argObj[key] = normalizedValue;
                                        }

                                        // Validate the value if a validation function is provided.
                                        if (config.validate) {
                                            const result = await config.validate(argObj[key], this);
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

export function WrapResponses<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            const methodNames = Object.getOwnPropertyNames(constructor.prototype);
            for (const methodName of methodNames) {
                if (methodName === 'constructor') continue;
                const originalMethod = (this as any)[methodName];
                if (typeof originalMethod === 'function') {
                    (this as any)[methodName] = async (...args: any[]) => {
                        const result = await originalMethod.apply(this, args);
                        return wrapResponse(result);
                    };
                }
            }
        }
    };
}
