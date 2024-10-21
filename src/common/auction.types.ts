export interface BidEvent {
    auction_id: string;
    value: string;
    user_id: string;
}

export interface RawAuctionResultI {

    id: string;
    domain: string;
    end_timestamp: number;
    initial_bid_amount: string;
    bid_amount: string;
    highest_bidder: string;
    original_buyer: string;
    domain_id: string;

}

export interface AuctionDetailsResponse {
    id: string;
    ends: number;
    domain: string;
    bids: {
        currentBid: BidI;
        initialBid: BidI;
        leaderBadgeId: string;
        originatorBadgeId: string;
    };
};

export interface BidI {

    usd: string;
    xrd: string;

}

export interface FormattedAuctionResultI {
    id: string;
    ends: number;
    bids: {
        currentBid: BidI;
        initialBid: BidI;
        leaderBadgeId: string;
        originatorBadgeId: string;
    }
}

export interface PaginatedResponse<T> {
    data: T[];
    next_cursor?: string;
    total_count: number;
}

export type AllAuctionsResponse = PaginatedResponse<FormattedAuctionResultI>;

export type AuctionBidResponse = PaginatedResponse<BidEvent>;
