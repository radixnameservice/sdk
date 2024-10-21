import { MetadataStringValue, ProgrammaticScryptoSborValueOwn, ProgrammaticScryptoSborValueTuple, State, StateEntityDetailsResponseComponentDetails, StateEntityDetailsVaultResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { nameMappings } from "../mappings/entities";
import { parsePricingTiers } from "./pricing.utils";
import { AddressMapT, NameMapKeysT } from "../common/entities.types";

export async function parseEntityDetails(entities: StateEntityDetailsVaultResponseItem[], state: State): Promise<AddressMapT> {

    const logicVersionStore = entities.find(entity => entity.details?.type === 'Component' && entity.details.blueprint_name === 'RNSUpdatable')?.details as StateEntityDetailsResponseComponentDetails | undefined;

    const getLogicComponents = async () => {

        const componentVersionsField = (logicVersionStore?.state as ProgrammaticScryptoSborValueTuple).fields.find(f => f.field_name === 'component_versions');

        const versionStoreIds = await state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: (componentVersionsField as ProgrammaticScryptoSborValueOwn).value,
                keys: [
                    { key_json: { kind: 'String', value: 'rns_logic' } },
                    { key_json: { kind: 'String', value: 'rns_auction_logic' } }
                ]
            }
        });

        const versionManagers = versionStoreIds.entries.map(kv => {
            return (kv.value.programmatic_json as ProgrammaticScryptoSborValueTuple).fields.reduce((acc, field) => {
                if ('value' in field && field.value && field.field_name) {
                    return { ...acc, [field.field_name]: field.value };
                }
                return acc;
            }, {} as { versions: string, current_version: string });
        });

        const logicComponents = await Promise.all(versionManagers.map(v => state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: v.versions,
                keys: [
                    { key_json: { kind: 'U64', value: v.current_version } },
                ]
            }
        }).then(kv => (kv.entries[0].value.programmatic_json as ProgrammaticScryptoSborValueOwn).value)));

        return { radixNameServiceComponent: logicComponents[0], rnsAuctionComponent: logicComponents[1] };
    }

    const logicComponents = logicVersionStore ? await getLogicComponents() : {};

    const addresses = entities.reduce((acc, entity) => {
        if (entity.details?.type === 'Component') {
            const state = entity.details?.state as { fields: any[] };
            const biddersVaultId = state.fields.find(f => f.field_name === 'bidders_vault')?.value;
            const settlementVaultId = state.fields.find(f => f.field_name === 'domain_settlement_periods')?.value;
            const subdomainVaults = state.fields.find(f => f.field_name === 'subdomain_vaults')?.value;
            const recordServiceVaultId = state.fields.find(f => f.field_name === 'record_vaults')?.value;
            const latestAuctionId = state.fields.find(f => f.field_name === 'auction_id')?.value;
            const latestBidId = state.fields.find(f => f.field_name === 'bid_id')?.value;
            const priceMap = parsePricingTiers(state.fields.find(f => f.field_name === 'price_mapping'));
            const minimumPremium = state.fields.find(f => f.field_name === 'minimum_premium')?.value;
            const domainEventClaimsKvId = state.fields.find(f => f.field_name === 'domain_event_claims')?.value;
            const domainTldKvId = state.fields.find(f => f.field_name === 'domain_mintable')?.value;
            const tokenUsdPriceKvStore = state.fields.find(f => f.field_name === 'token_usd_price')?.value;

            return {
                ...acc,
                [nameMappings[entity.details.blueprint_name as NameMapKeysT]]: entity.address,
                ...(subdomainVaults && { subdomainVaults }),
                ...(biddersVaultId && { biddersVaultId }),
                ...(settlementVaultId && { settlementVaultId }),
                ...(recordServiceVaultId && { recordServiceVaultId }),
                ...(latestAuctionId && { latestAuctionId }),
                ...(latestBidId && { latestBidId }),
                ...(priceMap && { priceMap }),
                ...(minimumPremium && { minimumPremium }),
                ...(domainEventClaimsKvId && { domainEventClaimsKvId  }),
                ...(domainTldKvId && { domainTldKvId  }),
                ...(tokenUsdPriceKvStore && { tokenUsdPriceKvStore: tokenUsdPriceKvStore }),
            };
        }

        const items = entity.explicit_metadata?.items;

        if (items?.length) {
            const resourceValue = (items[0].value.typed as MetadataStringValue).value;
            const key = nameMappings[resourceValue as NameMapKeysT];

            if (key) {
                return { ...acc, [key]: entity.address };
            }
        }

        return acc;
    }, {} as AddressMapT);

    return { ...logicComponents, ...addresses, };

}
