import { StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { RawPricePairI } from "./pricing.types";
import { DomainDataI } from "./domain.types";
import { RecordItemI } from "./record.types";

export interface ErrorStackResponseI {
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

export interface CommitmentSuccessI {
    code: string;
    details: string | null;
}

export interface CommitmentStackResponseI {
    success: CommitmentSuccessI[];
}

export interface ResultI<T> {
    data: T;
}

export interface PaginatedResponseI<T> {
    data: T[];
    next_cursor?: string;
    total_count: number;
}

export interface ResolvedRecordI {
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
}

export type ResolvedRecordResponseI = ResultI<{
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
} | null>;

export type DomainAttributesResponseT = ResultI<{
    status: string;
    verbose: string;
    price?: RawPricePairI;
} | null>;

export type RecordListResponseT = ResultI<{ records: RecordItemI[] | [] }>;
export type RecordResponseT = ResultI<{ record: RecordItemI | null }>;

export type DomainListResponseT = ResultI<{ domains: DomainDataI[] | [] }>;
export type DomainDetailsResponseT = ResultI<{ details: DomainDataI }>;

export type UserBadgeResponseT = ResultI<{ badgeId: string | null }>;
export type CheckAuthenticityResponseT = ResultI<{ isAuthentic: boolean }>;

export type ResolvedRecordResponseT = ResultI<{
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
} | null>;
