import RnsKit from '../..';
import { authenticitySchema, domainsSchema } from '../schemas';
import { matchObjectTypes } from '../utils';


describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return all domains within an account`, async () => {

        const ownerDomains = await rns.getAccountDomains('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

        expect(Array.isArray(ownerDomains)).toBe(true);
        expect(ownerDomains.length).toBeGreaterThan(0);
        expect(ownerDomains.every(domain => matchObjectTypes(domain, domainsSchema))).toBe(true);


    });

    /* ENABLE POST IMPLEMENTATION / CONFIG */

    // it(`should return primary-domain.xrd`, async () => {

    //     const primaryDomain = await rns.getAccountPrimaryDomain('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');
    //     expect(matchObjectTypes(primaryDomain, detailsSchema)).toBe(true);

    //     const typedPrimaryDomain = primaryDomain as DomainData;
    //     expect(typedPrimaryDomain?.name).toBe('primary-domain.xrd');
     
    // });

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
