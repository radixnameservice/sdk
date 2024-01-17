import RnsKit from '../..';
import { matchObjectTypes } from '../utils';

const domainsSchema = {
    id: 'string',
    name: 'string',
    subdomains: 'object',
    created_timestamp: 'number',
    last_valid_timestamp: 'number',
    key_image_url: 'string'
};

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return all domains within an account`, async () => {

        const ownerDomains = await rns.getAccountDomains('account_tdx_2_1298zn26mlsyc0gsx507cc83y7x8veyp90axzh6aefqhxxq9l7y03c7');

        expect(Array.isArray(ownerDomains)).toBe(true);
        expect(ownerDomains.length).toBeGreaterThan(0);
        expect(ownerDomains.every(domain => matchObjectTypes(domain, domainsSchema))).toBe(true);


    });
    
});