import { StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { RawPricePairI } from "./pricing.types";
import { DomainDataI, SubDomainDataI } from "./domain.types";
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

export interface PaginatedResponseI<T> {
    data: T[];
    next_cursor?: string;
    total_count: number;
}

export interface ResolvedRecordI {
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
}

export type DomainAttributesResponseT = {
    status: string;
    verbose: string;
    price?: RawPricePairI;
} | null;

export type RecordListResponseT = RecordItemI[] | [];
export type RecordResponseT = RecordItemI | null;

export type DomainListResponseT = DomainDataI[] | [];
export type DomainDetailsResponseT = DomainDataI;
export type SubDomainDetailsResponseT = SubDomainDataI;

export type CheckAuthenticityResponseT = { isAuthentic: boolean };

export type ResolvedRecordResponseT = {
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
} | null;
