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

const resolvedRecordSchema = {
    value: 'string',
    nonFungibleDataList: 'object'
};


describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a successful registration`, async () => {

        const randomStr = (Math.random() + 1).toString(36).substring(3);

        // const registerDomain = await rns.registerDomain(`test-registration-${randomStr}.xrd`, {

        // });

        // expect(registerDomain.status).toBe('registration-successful');

    });

});
