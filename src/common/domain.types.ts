import { RawPricePairI } from "./pricing.types";

export interface DomainDataI extends RootDomainI {

    price: RawPricePairI;
    subdomains?: SubDomainI[];
    subdomain_count?: number;

}

export interface SubDomainDataI extends SubDomainI {

    root_domain: DomainDataI;

}

export interface RootDomainI {

    id: string;
    name: string;
    address: string;
    created_timestamp: number;
    key_image_url: string;

}

export interface SubDomainI {

    id: string;
    name: string;
    created_timestamp: number;
    key_image_url: string;

}

export interface PaginationInfoI {
    next_page: number | null;
    previous_page: number | null;
    total_count: number;
    current_page_count: number;
}

export interface PaginatedDomainsResponseI {
    domains: DomainDataI[];
    pagination: PaginationInfoI;
}

export interface PaginatedSubdomainsResponseI {
    subdomains: SubDomainI[];
    pagination: PaginationInfoI;
    root_domain_id: string;
}

export interface DomainPaginationParamsI {
    maxResultLength?: number;
    page?: number;
}