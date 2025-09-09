import { StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { RawPricePairI } from "./pricing.types";
import { DomainDataI, PaginatedDomainsResponseI, PaginatedSubdomainsResponseI } from "./domain.types";
import { RecordItemI } from "./record.types";

export interface ErrorStackI {
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

export interface TransactionFeedbackI {
    code: string;
    details: string | null;
}

export interface TransactionFeedbackStackI {
    feedback: TransactionFeedbackI[];
}

export type SdkResponseT<T> = | { data: T; errors?: undefined } | { data?: undefined; errors: ErrorI[] };

export type SdkTransactionResponseT<T> = | { feedback: T; errors?: undefined } | { feedback?: undefined; errors: ErrorI[] };

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

export type PaginatedDomainListResponseT = PaginatedDomainsResponseI | [];

export type PaginatedSubdomainListResponseT = PaginatedSubdomainsResponseI | [];

export type CheckAuthenticityResponseT = { isAuthentic: boolean };

export type ResolvedRecordResponseT = ResolvedRecordI | null;
