import { priceFromXrd } from './pricing.utils';

export function stripExtension(domain: string) {

    return domain.split('.')[0];

}

export interface RawAuctionResultI {

    id: string;
    end_timestamp: number;
    initial_bid_amount: string;
    bid_amount: string;
    highest_bidder: string;
    original_buyer: string;
    domain_id: string;

}

export function formatAuction(auction: RawAuctionResultI) {

    return {
        id: auction.id,
        ends: auction.end_timestamp,
        bids: {
            currentBid: priceFromXrd(auction.bid_amount),
            initialBid: priceFromXrd(auction.initial_bid_amount),
            leaderBadgeId: auction.highest_bidder,
            originatorBadgeId: auction.original_buyer
        }
    };

}