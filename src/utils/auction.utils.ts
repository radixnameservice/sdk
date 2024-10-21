import { RawAuctionResultI } from '../common/auction.types';
import { priceFromXrd } from './pricing.utils';
import Decimal from "decimal.js";

export function stripExtension(domain: string) {

    return domain.split('.')[0];

}

export function formatAuction(auction: RawAuctionResultI, usdXrdRate: Decimal) {

    return {
        id: auction.id,
        ends: auction.end_timestamp,
        domain: auction.domain,
        bids: {
            currentBid: priceFromXrd(usdXrdRate, auction.bid_amount),
            initialBid: priceFromXrd(usdXrdRate, auction.initial_bid_amount),
            leaderBadgeId: auction.highest_bidder,
            originatorBadgeId: auction.original_buyer
        }
    };

}
