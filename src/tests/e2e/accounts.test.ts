import RnsSDK from '../..';
import { matchObjectTypes } from '../utils';

const domainsSchema = {
    id: 'string',
    name: 'string',
    subdomains: 'object',
    created_timestamp: 'number',
    last_valid_timestamp: 'number',
    key_image_url: 'string',
    address: 'string'
};

const authenticitySchema = {
    isAuthentic: 'boolean'
};

describe('RNS - Verify Domain Owner Accounts', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return all domains within an account`, async () => {

        const ownerDomains = await rns.getAccountDomains('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

        expect(Array.isArray(ownerDomains)).toBe(true);
        expect(ownerDomains.length).toBeGreaterThan(0);
        expect(ownerDomains.every(domain => matchObjectTypes(domain, domainsSchema))).toBe(true);


    });

    it(`should return as authentic`, async () => {

        const authenticity = await rns.checkAuthenticity({
            domain: 'radixnameservice.xrd',
            accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
        });

        expect(matchObjectTypes(authenticity, authenticitySchema)).toBe(true);
        expect(authenticity.isAuthentic).toBe(true);

    });

    it(`should return as inauthentic`, async () => {

        const authenticity = await rns.checkAuthenticity({
            domain: 'i-do-not-own-this.xrd',
            accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
        });

        expect(matchObjectTypes(authenticity, authenticitySchema)).toBe(true);
        expect(authenticity.isAuthentic).toBe(false);

    });

});
