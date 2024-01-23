import crypto from 'crypto-browserify';

export async function domainToNonFungId(name: string, isByteId = true) {

    const encoder = new TextEncoder();
    const data = encoder.encode(name);
    const buffer = Buffer.from(data);

    const hash = crypto.createHash('sha256').update(buffer);
    const hashBuffer = hash.digest();

    const truncatedHashBuffer = hashBuffer.slice(0, 16);

    const hexString = Array.from(new Uint8Array(truncatedHashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .reverse()
        .join('');

    return isByteId ? `[${hexString}]` : hexString;

}

export function stripExtension(domain: string) {

    return domain.split('.')[0];

}