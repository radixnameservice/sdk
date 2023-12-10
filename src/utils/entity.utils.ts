import { EntityMetadataItem, MetadataStringValue, StateEntityDetailsVaultResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { AddressMapT, NameMapKeysT, nameMappings } from "../mappings/entities";
import { parsePricingTiers } from "./pricing.utils";

function parseComponent(acc: AddressMapT, entity: StateEntityDetailsVaultResponseItem) {

    if (entity.details?.type !== 'Component') {
        return acc;
    }

    const state = entity.details?.state as { fields: any[] };
    const biddersVaultId = state.fields.find(f => f.field_name === 'bidders_vault')?.value;
    const settlementVaultId = state.fields.find(f => f.field_name === 'domain_settlement_periods')?.value;
    const recordServiceVaultId = state.fields.find(f => f.field_name === 'record_service')?.fields.find((f: { field_name: string, value: string }) => f.field_name === 'vaults')?.value;
    const latestAuctionId = +state.fields.find(f => f.field_name === 'auction_id')?.value;
    const priceMap = parsePricingTiers(state.fields.find(f => f.field_name === 'price_mapping'));
    const minimumPremium = state.fields.find(f => f.field_name === 'minimum_premium')?.value;

    return {
        ...acc,
        [nameMappings[entity.details.blueprint_name as NameMapKeysT]]: entity.address,
        ...(biddersVaultId && { biddersVaultId }),
        ...(settlementVaultId && { settlementVaultId }),
        ...(recordServiceVaultId && { recordServiceVaultId }),
        ...(latestAuctionId && { latestAuctionId }),
        ...(priceMap && { priceMap }),
        ...(minimumPremium && { minimumPremium })
    };

}

function parseNonFungResource(items: EntityMetadataItem[], acc: AddressMapT, entity: StateEntityDetailsVaultResponseItem) {

    const resourceValue = (items[0].value.typed as MetadataStringValue).value;
    const key = nameMappings[resourceValue as NameMapKeysT];

    if (key) {
        return { ...acc, [key]: entity.address };
    }

}

export function parseEntityDetails(entities: StateEntityDetailsVaultResponseItem[]) {

    return entities.reduce((acc, entity) => {

        if (entity.details?.type === 'Component') return parseComponent(acc, entity); // Entity is Component.
        if (entity.details?.type === 'NonFungibleResource') return parseNonFungResource(entity.explicit_metadata?.items, acc, entity); //Entity is Non Fungible Resource.

        return acc; //Entity is Fungible Resource.

    }, {} as AddressMapT);

}