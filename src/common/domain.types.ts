import { PricePairI } from "./pricing.types";

export interface DomainAttributesResponse {
    status: string;
    verbose: string;
    price?: PricePairI;
}

export interface DomainData {
    id: string,
    name: string,
    subdomains: DomainData[],
    created_timestamp: number,
    last_valid_timestamp: number,
    key_image_url: string,
    address: string | null,
}

export interface RootDomainI {
    
    id: string,
    name: string,
    address: DomainData[],
    created_timestamp: number,
    last_valid_timestamp: number,
    key_image_url: string,

}

export interface CheckAuthenticityResponse {
    isAuthentic: boolean;
}