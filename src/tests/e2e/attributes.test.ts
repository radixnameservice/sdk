import RnsKit from '../..';
import { attributesSchema } from '../schemas';
import { matchObjectTypes } from '../utils';


describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a 'registered' or 'settltment' status.`, async () => {

        const attributes = await rns.getDomainAttributes('radixnameservice.xrd');

        expect(matchObjectTypes(attributes, attributesSchema)).toBe(true);
        expect(attributes.status).not.toBe('available');

    });

});