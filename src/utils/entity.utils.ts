import { ProgrammaticScryptoSborValue, ProgrammaticScryptoSborValueMap, ProgrammaticScryptoSborValueOwn, ProgrammaticScryptoSborValueTuple, State, StateEntityDetailsResponseComponentDetails } from "@radixdlt/babylon-gateway-api-sdk";

import { parsePricingTiers } from "./pricing.utils";

import { AuctionStorageExpansionI, ComponentReferencesT, ComponentStateI, DomainStorageExpansionI, ExpandedComponentsT, ExpansionFunctionT, FeeServiceExpansionI, VersionedComponentsI } from "../common/entities.types";


export function getFieldValue(componentState: ComponentStateI, fieldName: string): string {
    const field = componentState.fields.find(f => f.field_name === fieldName);
    if (!field) {
        console.error(`Field '${fieldName}' not found in component state.`);
        return null;
    }
    return field.value;
}

export function getFieldMap(componentState: ComponentStateI, fieldName: string): ProgrammaticScryptoSborValueMap {
    const field = componentState.fields.find(f => f.field_name === fieldName) as ProgrammaticScryptoSborValueMap;
    if (!field) {
        console.error(`Field '${fieldName}' not found or not a map in component state.`);
        return null;
    }
    return field;
}

async function getActiveComponents(
    componentVersions: ProgrammaticScryptoSborValue,
    state: State
): Promise<VersionedComponentsI> {
    try {
        const versionStoreIds = await state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: (componentVersions as ProgrammaticScryptoSborValueOwn).value,
                keys: [
                    { key_json: { kind: 'String', value: 'rns_logic' } },
                    { key_json: { kind: 'String', value: 'rns_auction_logic' } }
                ]
            }
        });

        const versionManagers = versionStoreIds.entries.map(kv => {
            return (kv.value.programmatic_json as ProgrammaticScryptoSborValueTuple).fields.reduce((acc, field) => {
                if ('value' in field && field.value && field.field_name) {
                    acc[field.field_name] = field.value;
                }
                return acc;
            }, {} as { versions: string, current_version: string });
        });

        const logicComponents = await Promise.all(
            versionManagers.map(v =>
                state.innerClient.keyValueStoreData({
                    stateKeyValueStoreDataRequest: {
                        key_value_store_address: v.versions,
                        keys: [{ key_json: { kind: 'U64', value: v.current_version } }]
                    }
                }).then(kv => (kv.entries[0].value.programmatic_json as ProgrammaticScryptoSborValueOwn).value)
            )
        );

        return { rnsCoreComponent: logicComponents[0], rnsAuctionComponent: logicComponents[1] };
    } catch (error) {
        console.error("Failed to fetch active components:", error);
        throw error;
    }
}

const expansionRouteMap: { [K in keyof ComponentReferencesT]: ExpansionFunctionT } = {

    domainStorage: (componentDetails): DomainStorageExpansionI => {
        const componentState = componentDetails.state as ComponentStateI;
        return {
            recordServiceStoreAddr: getFieldValue(componentState, "record_vaults"),
            domainEventClaimsStoreAddr: getFieldValue(componentState, "domain_event_claims"),
            domainTldConfigKVAddr: getFieldValue(componentState, "domain_mintable"),
            settlementConfigStoreAddr: getFieldValue(componentState, "domain_settlement_periods"),
            subdomainStoreAddr: getFieldValue(componentState, "subdomain_vaults"),
            minimumPremium: getFieldValue(componentState, "minimum_premium"),
            priceMap: parsePricingTiers(getFieldMap(componentState, "price_mapping"))
        };
    },

    auctionStorage: (componentDetails): AuctionStorageExpansionI => {
        const componentState = componentDetails.state as ComponentStateI;
        return {
            biddersStoreAddr: getFieldValue(componentState, "bidders_vault"),
            latestAuctionId: getFieldValue(componentState, "auction_id"),
            latestBidId: getFieldValue(componentState, "bid_id")
        };
    },

    feeService: (componentDetails): FeeServiceExpansionI => {
        const componentState = componentDetails.state as ComponentStateI;
        return {
            xrdToUsdRateAddr: getFieldValue(componentState, "token_usd_price")
        };
    },

    coreVersionManager: async (componentDetails, state): Promise<VersionedComponentsI> => {
        const componentState = componentDetails.state as ComponentStateI;
        const componentVersions = getFieldMap(componentState, "component_versions");
        return getActiveComponents(componentVersions, state);
    }

};

export async function expandComponents(components: ComponentReferencesT, state: State): Promise<ExpandedComponentsT> {

    try {

        const expandedEntries = await Promise.all(

            Object.entries(components).map(async ([componentName, address]) => {
                const aggregatedComponentDetails = await state.innerClient.stateEntityDetails({
                    stateEntityDetailsRequest: { addresses: [address] }
                });

                const expandedComponent = await expansionRouteMap[componentName as keyof ComponentReferencesT](
                    aggregatedComponentDetails.items[0].details as StateEntityDetailsResponseComponentDetails,
                    state
                );

                return [componentName, { rootAddr: address, ...expandedComponent }] as const;
            })

        );

        return Object.fromEntries(expandedEntries) as ExpandedComponentsT;
    } catch (error) {
        console.error("Failed to expand components:", error);
        throw error;
    }
}
