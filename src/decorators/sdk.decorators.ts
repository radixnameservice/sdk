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
