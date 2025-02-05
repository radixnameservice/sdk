export function matchObjectTypes<T>(
    obj: unknown,
    expectedKeys: (keyof T)[]
): obj is T {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    for (const key of expectedKeys) {
        if (!(key in obj)) {
            return false;
        }
    }

    return true;
}

export function normaliseManifest(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
}