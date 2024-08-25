import RnsKit from '../..';
import { detailsSchema } from '../schemas';
import { matchObjectTypes } from '../utils';

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it('should return correct domain details', async () => {

        const details = await rns.getDomainDetails('radixnameservice.xrd');

        expect(matchObjectTypes(details, detailsSchema)).toBe(true);
    });

});

