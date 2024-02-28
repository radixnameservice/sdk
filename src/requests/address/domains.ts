import { ProgrammaticScryptoSborValueOwn, ProgrammaticScryptoSborValueTuple } from "@radixdlt/babylon-gateway-api-sdk";
import { InstancePropsI } from "../../common/entities.types";
import { domainToNonFungId } from "../../utils/domain.utils";

export interface RawDomainData {
    id: string,
    name: string,
    created_timestamp: number,
    last_valid_timestamp: number,
    key_image_url: string
}

export async function requestAccountDomains(accountAddress: string, { state, entities }: InstancePropsI) {

    if (!accountAddress) return null;

    try {

        const accountNfts = await state.getEntityDetailsVaultAggregated(accountAddress);

        const ids = accountNfts.non_fungible_resources.items.find(nft => nft.resource_address === entities.domainNameResource)?.vaults.items[0].items ?? [];

        const subdomainVaultFromKvStore = ids.length ? await state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: entities.subdomainVaults,
                keys: ids.map(id => ({ key_json: { kind: 'NonFungibleLocalId', value: id } }))
            }
        }).then(r => r.entries) : [];

        const subdomainVaultIds = subdomainVaultFromKvStore.length
            ? subdomainVaultFromKvStore.map(kvResponse => (kvResponse.value.programmatic_json as ProgrammaticScryptoSborValueOwn).value)
            : [];

        const subdomainIds = await Promise.all(
            subdomainVaultIds.map(subdomainVaultId => state.innerClient.entityNonFungibleIdsPage({
                stateEntityNonFungibleIdsPageRequest: {
                    address: entities.rnsStorage,
                    resource_address: entities.domainNameResource,
                    vault_address: subdomainVaultId
                }
            }).then(res => res.items)));

        const allOwnedSubdomains = subdomainIds.flatMap(r => r);

        const nftData = await state.getNonFungibleData(entities.domainNameResource, [...ids, ...allOwnedSubdomains]);

        const subdomains = nftData.filter(r => {
            return r.data?.programmatic_json.kind === 'Tuple'
                && r.data?.programmatic_json.fields.some(
                    field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name !== 'None'
                )
        }).map(r => {
            if (r.data?.programmatic_json.kind === 'Tuple') {
                return r.data?.programmatic_json.fields.reduce((acc, field) => {
                    if (field.kind === 'String' && field.field_name) {
                        return { ...acc, [field.field_name]: field.value };
                    }

                    if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
                        return { ...acc, [field.field_name]: +field.value * 1000 };
                    }

                    if (field.field_name === 'last_valid_timestamp' && field.kind === 'Enum' && field.variant_name !== 'None' && field.fields[0].kind === 'I64') {
                        return { ...acc, [field.field_name]: +field.fields[0].value * 1000 };
                    }

                    return acc;
                }, { id: r.non_fungible_id } as RawDomainData);
            }
        });

        return nftData
            .filter(r => {
                return r.data?.programmatic_json.kind === 'Tuple'
                    && r.data?.programmatic_json.fields.some(
                        field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name === 'None'
                    )
            })
            .map(r => {
                if (r.data?.programmatic_json.kind === 'Tuple') {
                    return r.data?.programmatic_json.fields.reduce((acc, field) => {
                        if (field.kind === 'String' && field.field_name === 'name') {
                            const filteredSubdomain = subdomains.filter(s => s?.name.includes(field.value))
                            return { ...acc, [field.field_name]: field.value, subdomains: filteredSubdomain };
                        }

                        if (field.kind === 'String' && field.field_name) {
                            return { ...acc, [field.field_name]: field.value };
                        }

                        if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
                            return { ...acc, [field.field_name]: +field.value * 1000 };
                        }

                        if (field.field_name === 'last_valid_timestamp' && field.kind === 'Enum' && field.variant_name !== 'None' && field.fields[0].kind === 'I64') {
                            return { ...acc, [field.field_name]: +field.fields[0].value * 1000 };
                        }

                        return acc;
                    }, { id: r.non_fungible_id } as RawDomainData);
                }
            });

    } catch (e) {

        console.log(e);
        return null;

    }

}

export async function requestDomainDetails(domain: string, { state, entities }: InstancePropsI): Promise<RawDomainData> {
    const domainId = await domainToNonFungId(domain);

    const nftData = await state.getNonFungibleData(entities.domainNameResource, domainId);

    if (!nftData) return null;

    return (nftData.data?.programmatic_json as ProgrammaticScryptoSborValueTuple).fields.reduce((acc, field) => {
        if (field.kind === 'String' && field.field_name === 'name') {
            return { ...acc, [field.field_name]: field.value };
        }

        if (field.kind === 'String' && field.field_name) {
            return { ...acc, [field.field_name]: field.value };
        }

        if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
            return { ...acc, [field.field_name]: +field.value * 1000 };
        }

        if (field.field_name === 'last_valid_timestamp' && field.kind === 'Enum' && field.variant_name !== 'None' && field.fields[0].kind === 'I64') {
            return { ...acc, [field.field_name]: +field.fields[0].value * 1000 };
        }

        return acc;
    }, { id: nftData.non_fungible_id } as RawDomainData);
}
