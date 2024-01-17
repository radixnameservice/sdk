import RnsKit from '../..';
import { matchObjectTypes } from '../utils';

const recordsSchema = {
    record_id: 'string',
    id_additions: 'object',
    domain_id: 'string',
    context: 'string',
    directive: 'string',
    platform_identifier: 'string',
    value: 'string'
};

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a corresponding record array of docket objects`, async () => {

        const records = await rns.getRecords('test-records-present.xrd');

        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);
        expect(records.every(record => matchObjectTypes(record, recordsSchema))).toBe(true);


    });

    it('should return a empty array', async () => {

        const records = await rns.getRecords('test-records-blank.xrd');

        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeLessThan(1);

    });

    // it('should return a specific stokenet address', async () => {
        
    //     const resolvedRecord = await rns.resolveRecord('test-records-present.xrd', 'navigation', undefined, 'xrd.domains:navigation.web3');
    //     expect(resolvedRecord).toBe('account_tdx_2_1298zn26mlsyc0gsx507cc83y7x8veyp90axzh6aefqhxxq9l7y03c7');

    // });

});