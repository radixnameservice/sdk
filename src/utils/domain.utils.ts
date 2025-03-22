import errors from '../mappings/errors';

import { ErrorI } from '../common/response.types';

export async function domainToNonFungId(name: string, isByteId = true) {

    if (typeof globalThis.crypto === 'undefined') {
        try {
            const { webcrypto } = await import('crypto');
            globalThis.crypto = webcrypto;
        } catch (error) {
            throw new Error('No suitable crypto module found in this environment.');
        }
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(name);

    const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(digest);

    const truncatedHash = hashArray.slice(0, 16);

    const hexString = Array.from(truncatedHash)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .reverse()
        .join('');

    return isByteId ? `[${hexString}]` : hexString;

}

export function stripExtension(domain: string) {

    return domain.split('.')[0];

}

export function validateDomain(domain: string): true | ErrorI {

    const parts = domain.split('.');

    if (parts?.[1] !== 'xrd')
        return errors.domain.invalid({ domain, verbose: 'Invalid domain extension.' });

    if (parts[0].length < 2)
        return errors.domain.invalid({ domain, verbose: 'Domain name must be 2+ characters in length.' });

    if (parts[0].length > 65)
        return errors.domain.invalid({ domain, verbose: 'Max domain length is 65 characters.' });

    if (domain.includes('_'))
        return errors.domain.invalid({ domain, verbose: 'Special characters are not permitted (except for hyphens).' });

    const domainFormatRegex = /^(([a-zA-Z0-9]{2,})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.xrd$/;

    if (domainFormatRegex.test(domain) === false)
        return errors.domain.invalid({ domain, verbose: 'Domain name format is incorrect.' });


    return true;
}

export function validateSubdomain(subdomain: string): true | ErrorI {

    const parts = subdomain.split('.');

    if (parts?.length !== 3 || parts[0].length < 2)
        return errors.subdomain.invalid({ subdomain, verbose: 'Invalid subdomain format. Format should follow {subdomain}.{primary-domain}.xrd' });

    if (subdomain.includes('_'))
        return errors.subdomain.invalid({ subdomain, verbose: 'Special characters are not permitted (except for hyphens).' });

    const subdomainFormatRegex = /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9\-]{1,61}[a-zA-Z0-9]))(\.([a-zA-Z0-9][a-zA-Z0-9\-]{1,61}[a-zA-Z0-9]))*\.xrd$/;

    if (subdomainFormatRegex.test(subdomain) === false)
        return errors.subdomain.invalid({ subdomain, verbose: 'Subdomain name format is incorrect.' });

    return true;
}

export function normaliseDomain(domain: string) {

    return domain.trim().toLowerCase();

}

export function deriveRootDomain(subdomain: string) {

    const domainParts = subdomain.split('.');

    const secondToLastDotIndex = domainParts.length - 2;

    const rootDomain = domainParts.slice(secondToLastDotIndex).join('.');

    if (rootDomain.includes('.')) {
        return rootDomain;
    }

    return null;

}
