import { Buffer } from 'buffer';
import * as CryptoJS from 'crypto-js';

export async function domainToNonFungId(name: string, isByteId = true) {

    const data = CryptoJS.enc.Utf8.parse(name);
    
    const hash = CryptoJS.SHA256(data);
    const hashBuffer = Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex');

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

export function validateDomain(domain: string) {

    const parts = domain.split('.');

    if (parts?.[1] !== 'xrd') {

        return {
            valid: false,
            message: "Invalid domain extension."
        };

    }

    if (parts[0].length < 2) {

        return {
            valid: false,
            message: "Domain name must be 2+ characters in length."
        };

    }

    if (parts[0].length > 65) {

        return {
            valid: false,
            message: "Max domain length is 65 characters."
        };

    }

    if (domain.includes('_')) {

        return {
            valid: false,
            message: "Special characters are not permitted (except for hyphens)."
        };

    }

    const regex = /^(([a-zA-Z0-9]{2,})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.xrd$/;

    if (regex.test(domain) === false) {

        return {
            valid: false,
            message: "Please enter a valid domain name."
        };

    }

    return {
        valid: true,
        message: ''
    };

}

export function validateSubdomain(subdomain: string) {

    const parts = subdomain.split('.');

    if (parts?.length !== 3 || parts[0].length < 2) {

        return {
            valid: false,
            message: "Invalid subdomain format. Format should follow {subdomain}.{primary-domain}.xrd"
        };

    }

    if (subdomain.includes('_')) {

        return {
            valid: false,
            message: "Special characters are not permitted (except for hyphens)."
        };

    }

    const regex = /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9\-]{1,61}[a-zA-Z0-9]))(\.([a-zA-Z0-9][a-zA-Z0-9\-]{1,61}[a-zA-Z0-9]))*\.xrd$/;

    if (regex.test(subdomain) === false) {

        return {
            valid: false,
            message: "Please enter a valid subdomain name format."
        };

    }

    return {
        valid: true,
        message: ''
    };

}

export function validateDomainEntity(domain: string) {

    const isValidDomain = validateDomain(domain);
    const isValidSubdomain = validateSubdomain(domain);

    if (!isValidDomain.valid && !isValidSubdomain.valid) {

        return {
            valid: false,
            message: isValidDomain.message.trim().length > 0 ? isValidDomain.message : isValidSubdomain.message.trim().length > 0 ? isValidSubdomain.message : 'Unknown domain validation error.'
        }

    }

    return {
        valid: true,
        message: ''
    }

}

export function normaliseDomain(domain: string) {

    return domain.trim().toLowerCase();

}