import RnsKit from '../..';
import { RecordResultI } from '../../common/records.types';
import { matchObjectTypes } from '../utils';

const recordsSchema: RecordResultI = {
    record_id: 'string',
    id_additions: [],
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

});