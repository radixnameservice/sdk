import RnsSDK from '../..';
import { RootDomainI } from '../../common/domain.types';
import { matchObjectTypes } from '../utils';

describe('RNS - Fetch Domain Details', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it('should return correct domain details', async () => {

        const details = await rns.getDomainDetails({ domain: 'radixnameservice.xrd' });

        if (details.errors) {
            throw new Error('Domain details were not returned.');
        }

        if (!matchObjectTypes<RootDomainI>(details.data, ['id', 'name', 'address', 'created_timestamp', 'key_image_url'])) {
            throw new Error('Domain object did not match expected schema');
        }

    });

});

