import RnsKit from '../..';
import { recordsSchema, resolvedRecordSchema } from '../schemas';
import { matchObjectTypes } from '../utils';


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

    it('should return a specific stokenet address', async () => {

        const resolvedRecord = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            context: 'receivers',
            directive: '*'
        });

        expect(resolvedRecord.value).toBe('account_tdx_2_128jmkhrkxwd0h9vqfetw34ars7msls9kmk5y60prxsk9guwuxskn5p');

    });


    it('should return proven resource nfts', async () => {

        const record = await rns.resolveRecord({
            domain: 'test-records-present.xrd',
            context: 'social',
            directive: 'selfi:pfps',
            proven: true
        });

        expect(Array.isArray(record.nonFungibleDataList)).toBe(true);
        expect(matchObjectTypes(record, resolvedRecordSchema)).toBe(true);
    });

});
