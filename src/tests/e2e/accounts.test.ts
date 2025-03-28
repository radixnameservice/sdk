import RnsSDK, { DomainDataI } from '../..';
import { matchObjectTypes } from '../utils';

describe('RNS - Verify Domain Owner Accounts', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return all domains within an account`, async () => {

        const ownerDomains = await rns.getAccountDomains({ accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p' });

        if (ownerDomains.errors) {
            throw new Error('Domain list fetch failed');
        }

        expect(Array.isArray(ownerDomains.data)).toBe(true);
        expect(ownerDomains.data.length).toBeGreaterThan(0);
        expect(ownerDomains.data.every(domain => matchObjectTypes<DomainDataI>(domain, ['id', 'name', 'subdomains', 'created_timestamp', 'key_image_url', 'address']))).toBe(true);

    });

    it(`should return as authentic`, async () => {

        const checkAuthenticity = await rns.checkAuthenticity({
            domain: 'radixnameservice.xrd',
            accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
        });

        if (checkAuthenticity.errors) {
            throw new Error('Authenticity check failed');
        }

        if (!matchObjectTypes<{ isAuthentic: boolean }>(checkAuthenticity.data, ['isAuthentic'])) {
            throw new Error('Authenticity object did not match expected schema');
        }

        expect('isAuthentic' in checkAuthenticity.data).toBe(true);

    });

    it(`should return as inauthentic`, async () => {

        const checkAuthenticity = await rns.checkAuthenticity({
            domain: 'i-do-not-own-this.xrd',
            accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
        });

        if (checkAuthenticity.errors) {
            throw new Error('Authenticity check failed');
        }

        if (!matchObjectTypes<{ isAuthentic: boolean }>(checkAuthenticity.data, ['isAuthentic'])) {
            throw new Error('Authenticity object did not match expected schema');
        }

        expect('isAuthentic' in checkAuthenticity && checkAuthenticity.data.isAuthentic).toBe(false);

    });

});
