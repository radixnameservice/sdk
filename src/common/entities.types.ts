import { State, StateEntityDetailsResponseComponentDetails } from "@radixdlt/babylon-gateway-api-sdk";
import { parsePricingTiers } from "../utils/pricing.utils";
import { NetworkT } from "../utils/gateway.utils";

export type ComponentReferencesT = {

    domainStorage: string;
    auctionStorage: string;
    feeService: string;
    coreVersionManager: string;

};

export type EntityStructT = {

    components: ComponentReferencesT;
    resources: {
        collections: {
            launchCommemoration: string;
            auctions: string;
            domains: string;
            records: string;
        }
        badges: {
            serviceDeployment: string;
            upgrade: string;
            admin: string;
            storage: string;
            service: string;
            rnsUser: string;
            domainUser: string;
            auctionBid: string;
            actionClaims: string;
            auctionSettlement: string;
            sunriseLandrushInitiativeSeed: string;
            activation: string;
        }
        transients: {
            subdomainRecaller: string;
        }
    }

};

export type EntitiesConfigT = {

    [key in NetworkT]: EntityStructT;

};

export interface InstancePropsI {

    state: State;
    entities: EntitiesT;

}

export interface ComponentDetailsI {

    kind: string;
    type_name: string;
    field_name: string;
    value: string;

}

export interface ComponentCommonI {

    rootAddr: string;

}

export interface VersionedComponentsI {

    rnsCoreComponent: string;
    rnsAuctionComponent: string;

}

export interface DomainStorageExpansionI {
    recordServiceStoreAddr: string;
    domainEventClaimsStoreAddr: string;
    domainTldConfigKVAddr: string;
    settlementConfigStoreAddr: string;
    subdomainStoreAddr: string;
    minimumPremium: string;
    priceMap: ReturnType<typeof parsePricingTiers>;
}

export interface AuctionStorageExpansionI {
    biddersStoreAddr: string;
    latestAuctionId: string;
    latestBidId: string;
}

export interface FeeServiceExpansionI {
    xrdToUsdRateAddr: string | undefined;
}

export type ExpansionI = VersionedComponentsI | DomainStorageExpansionI | AuctionStorageExpansionI | FeeServiceExpansionI;

export type ExpansionFunctionT<T = StateEntityDetailsResponseComponentDetails> = (componentDetails: T, state?: State) => Promise<ExpansionI> | ExpansionI;

export interface ComponentStateI {
    fields: [{
        field_name: string;
        value?: string;
    }];
}

export type ExpandedComponentsT = {

    domainStorage: DomainStorageExpansionI & ComponentCommonI;
    auctionStorage: AuctionStorageExpansionI & ComponentCommonI;
    feeService: FeeServiceExpansionI & ComponentCommonI;
    coreVersionManager: VersionedComponentsI & ComponentCommonI;

};

export type EntitiesT = Omit<EntityStructT, "components"> & { components: ExpandedComponentsT };