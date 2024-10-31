import { State, Status } from "@radixdlt/babylon-gateway-api-sdk";
import { nameMappings, PriceTier } from "../mappings/entities";
import { DependenciesI } from "./dependencies.types";
import RnsSDK from "..";

export interface InstancePropsI {
    sdkInstance: RnsSDK;
}

export type NameMapKeysT = keyof typeof nameMappings;
export type NameMapValuesT = (typeof nameMappings)[NameMapKeysT];

export type AddressMapT = Record<
    NameMapValuesT | 'settlementVaultId' | 'biddersVaultId' | 'recordServiceVaultId' | 'subdomainVaults' | 'rnsStorage' | 'domainEventClaimsKvId' | 'domainTldKvId' | 'tokenUsdPriceKvStore',
    string
> & { latestAuctionId: string, latestBidId: string, priceMap: Record<PriceTier, string> } | null;
