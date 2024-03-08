export function matchObjectTypes(obj, schema) {

    for (const key in schema) {

        if (schema.hasOwnProperty(key)) {

            const expectedType = schema?.[key];
            const receivedValue = obj?.[key];

            if (typeof receivedValue !== expectedType) {
                console.debug(key, expectedType, receivedValue);
                return false;
            }

        }

    }

    return true;

}
