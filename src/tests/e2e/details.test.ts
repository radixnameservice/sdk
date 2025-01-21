import RnsSDK from '../..';
import { PrimaryDomainI } from '../../common/domain.types';
import { matchObjectTypes } from '../utils';

describe('RNS - Fetch Domain Details', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it('should return correct domain details', async () => {

        const details = await rns.getDomainDetails('radixnameservice.xrd');
        
        if (!matchObjectTypes<PrimaryDomainI>(details, ['id', 'name', 'address', 'created_timestamp', 'last_valid_timestamp', 'key_image_url'])) {
            throw new Error('Domain object did not match expected schema');
        }

    });

});

