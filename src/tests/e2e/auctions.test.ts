import RnsKit from '../..';
import { auctionSchema } from '../schemas';
import { matchObjectTypes } from '../utils';


describe('RnsKit', () => {

    const rns = new RnsKit({ network: 'stokenet' });

    it(`should return a schema match.`, async () => {

        const auction = await rns.getAuction('auction.xrd');
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