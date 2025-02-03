import { StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { PricePairI } from "./pricing.types";
import { BidEvent, BidI, FormattedAuctionResultI } from "./auction.types";
import { DomainData } from "./domain.types";

export interface ErrorStackResponse {

    errors: ErrorI[];

}

export interface ErrorI {

    code: string;
    error: string;
    verbose: string | null;

}

export interface ErrorGenerationI {

    verbose?: string | null;

}

export interface SuccessI {

    code: string;
    details: string | null;

}

export interface CommitmentStackResponse {

    success: SuccessI[];

}

export interface ResolvedRecordResponse {
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
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
    }
}

export interface CheckAuthenticityResponse {
    isAuthentic: boolean;
}

export interface DomainAttributesResponse {
    status: string;
    verbose: string;
    price?: PricePairI;
}

export interface PaginatedResponse<T> {
    data: T[];
    next_cursor?: string;
    total_count: number;
}

export type AllAuctionsResponse = PaginatedResponse<FormattedAuctionResultI>;

export type AuctionBidResponse = PaginatedResponse<BidEvent>;

export type UserBadgeResponse = string | null;

export type AccountDomainsResponse = DomainData[];
