import RnsKit from '../..';
import { matchObjectTypes } from '../utils';

const auctionSchema = {
    id: 'string',
    ends: 'number',
    bids: 'object'
};

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a schema match.`, async () => {

        const auction = await rns.getAuction('nft.xrd');
        expect(typeof auction === 'object').toBe(true);
        expect(matchObjectTypes(auction, auctionSchema)).toBe(true);

    });

});