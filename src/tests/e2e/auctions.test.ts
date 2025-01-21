import RnsSDK, { AuctionDetailsResponse } from '../..';
import { matchObjectTypes } from '../utils';

describe('RNS - Fetch Auction Details', () => {

    const rns = new RnsSDK({ network: 'stokenet' });

    it(`should return a schema match.`, async () => {

        const auction = await rns.getAuction('auction.xrd');
        expect(typeof auction === 'object').toBe(true);

        if (!matchObjectTypes<AuctionDetailsResponse>(auction, ['id', 'ends', 'domain', 'bids'])) {
            throw new Error('Auction object did not match expected schema');
        }

    });

    it(`should return a paginated auction object.`, async () => {

        const auctions = await rns.getAllAuctions();
        expect(typeof auctions === 'object' && typeof auctions.data === 'object').toBe(true);
        expect(auctions.total_count > 0).toBe(true);

        if (!matchObjectTypes<AuctionDetailsResponse>(auctions.data[0], ['id', 'ends', 'domain', 'bids'])) {
            throw new Error('Auction object did not match expected schema');
        }


    });

});