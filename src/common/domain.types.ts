export interface DomainDataI extends RootDomainI {

    subdomains: SubDomainI[];

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