export interface BidEvent {
    auction_id: string;
    value: string;
    user_id: string;
}

export interface Auction {
    id: string;
    bid_amount: string;
    initial_bid_amount: string;
    highest_bidder: string;
    original_buyer: string;
    end_timestamp: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    next_cursor?: string;
    total_count: number;
}

export type AllAuctionsResponse = PaginatedResponse<Auction>;

export type AuctionBidResponse = PaginatedResponse<BidEvent>;
