import { StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { RawPricePairI } from "./pricing.types";
import { DomainDataI } from "./domain.types";

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

export interface SuccessI {

    code: string;
    details: string | null;

}

export interface CommitmentStackResponseI {

    success: SuccessI[];

}

export interface ResolvedRecordResponseI {
    value: string;
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[];
}

export interface CheckAuthenticityResponseI {
    isAuthentic: boolean;
}

export interface DomainAttributesResponseI {
    status: string;
    verbose: string;
    price?: RawPricePairI;
}

export interface PaginatedResponseI<T> {
    data: T[];
    next_cursor?: string;
    total_count: number;
}

export type UserBadgeResponseT = string | null;

export type AccountDomainsResponseT = DomainDataI[];
