import RnsSDK, { DomainAttributesResponseT } from '../..';
import Decimal from 'decimal.js';
import { matchObjectTypes } from '../utils';
import { convertToDecimal } from '../../utils/decimal.utils';

describe('RNS - Fetch Domain Attributes', () => {
    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return a 'registered' or 'settlement' status and decimal / numerical denoted price.`, async () => {

        const attributes = await rns.getDomainStatus({ domain: 'radixnameservice.xrd' });

        if (attributes.errors) {
            throw new Error('Domain status was not returned.');
        }

        if (!matchObjectTypes<DomainAttributesResponseT>(attributes.data, ['status', 'verbose', 'price'])) {
            throw new Error('Attributes did not match expected schema');
        }

        expect(attributes.data.status).not.toBe('available');
        expect(
            typeof attributes.data.price === 'object' &&
            typeof attributes.data.price.usd === 'number' &&
            (typeof attributes.data.price.xrd === 'number' || typeof attributes.data.price.xrd === 'object')
        ).toBe(true);

        const xrdPriceDecimal = convertToDecimal(attributes.data.price.xrd);
        expect(xrdPriceDecimal).toBeInstanceOf(Decimal);
        expect(xrdPriceDecimal.toNumber()).toBeGreaterThan(0);
        expect(attributes.data.price.usd).toBe(4);

    });
});
