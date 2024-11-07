import RnsSDK from '../..';
import { matchObjectTypes } from '../utils';

const detailsSchema = {
    id: 'string',
    name: 'string',
    address: 'string',
    created_timestamp: 'number',
    last_valid_timestamp: 'number',
    key_image_url: 'string'
}


describe('RNS - Fetch Domain Details', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it('should return correct domain details', async () => {

        const details = await rns.getDomainDetails('radixnameservice.xrd');

        expect(matchObjectTypes(details, detailsSchema)).toBe(true);
    });

});

