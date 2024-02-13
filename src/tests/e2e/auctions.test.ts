import RnsKit from '../..';
import { matchObjectTypes } from '../utils';

const auctionSchema = {
    id: 'string',
    ends: 'number',
    domain: 'string',
    bids: 'object'
};

describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a schema match.`, async () => {

        const auction = await rns.getAuction('nft.xrd');
        console.log(auction)
        expect(typeof auction === 'object').toBe(true);
        expect(matchObjectTypes(auction, auctionSchema)).toBe(true);

    });

    it(`should return a paginated auction object.`, async () => {

        const auctions = await rns.getAllAuctions();
        expect(typeof auctions === 'object' && typeof auctions.data === 'object').toBe(true);
        expect(auctions.total_count > 0).toBe(true);
        expect(matchObjectTypes(auctions.data[0], auctionSchema)).toBe(true);

    });

});