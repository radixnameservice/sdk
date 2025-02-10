import RnsSDK, { CheckAuthenticityResponseI, DomainDataI } from '../..';
import { matchObjectTypes } from '../utils';

describe('RNS - Verify Domain Owner Accounts', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return all domains within an account`, async () => {

        const ownerDomains = await rns.getAccountDomains('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

        if ('errors' in ownerDomains) {
            throw new Error('Domain list fetch failed');
        }

        expect(Array.isArray(ownerDomains)).toBe(true);
        expect(ownerDomains.length).toBeGreaterThan(0);
        expect(ownerDomains.every(domain => matchObjectTypes<DomainDataI>(domain, ['id', 'name', 'subdomains', 'created_timestamp', 'last_valid_timestamp', 'key_image_url', 'address']))).toBe(true);

    });

    it(`should return as authentic`, async () => {

        const authenticity = await rns.checkAuthenticity({
            domain: 'radixnameservice.xrd',
            accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
        });

        if (!matchObjectTypes<CheckAuthenticityResponseI>(authenticity, ['isAuthentic'])) {
            throw new Error('Authenticity object did not match expected schema');
        }

        expect('isAuthentic' in authenticity && authenticity.isAuthentic).toBe(true);

    });

    it(`should return as inauthentic`, async () => {

        const authenticity = await rns.checkAuthenticity({
            domain: 'i-do-not-own-this.xrd',
            accountAddress: 'account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p'
        });

        if (!matchObjectTypes<CheckAuthenticityResponseI>(authenticity, ['isAuthentic'])) {
            throw new Error('Authenticity object did not match expected schema');
        }

        expect('isAuthentic' in authenticity && authenticity.isAuthentic).toBe(false);

    });
    
});
