import RnsKit from '../..';
import { matchObjectTypes } from '../utils';

const attributesSchema = {
    status: 'string',
    verbose: 'string'
};


describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a 'registered' status.`, async () => {

        const attributes = await rns.getDomainAttributes('wylie.xrd');

        expect(matchObjectTypes(attributes, attributesSchema)).toBe(true);
        expect(attributes.status).toBe('registered');

    });

});