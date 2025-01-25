import { ProgrammaticScryptoSborValueOwn, ProgrammaticScryptoSborValueReference, ProgrammaticScryptoSborValueTuple, State, StateEntityDetailsVaultResponseItem, StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";

import { deriveRootDomain, domainToNonFungId } from "../../utils/domain.utils";
import { batchArray } from "../../utils/array.utils";

import { DomainData, SubDomainI } from "../../common/domain.types";
import { InstancePropsI } from "../../common/entities.types";

import { BATCHED_KV_STORE_LIMIT } from "../../api.config";

function filterUserDomainVault(accountNfts, domainResourceAddr) {

    return accountNfts.non_fungible_resources.items.find(
        (nft) => nft.resource_address === domainResourceAddr
    )?.vaults.items[0];

}

async function fetchRootDomainIds(
    accountAddress: string,
    accountNfts: StateEntityDetailsVaultResponseItem,
    { sdkInstance }: InstancePropsI
): Promise<string[]> {

    const accountDomainVault = filterUserDomainVault(accountNfts, sdkInstance.entities.resources.collections.domains);

    if (!accountDomainVault?.items) {
        return [];
    }

    let { items: domainIds, vault_address: userDomainVaultAddr } = accountDomainVault;

    if (!accountDomainVault?.next_cursor) {
        return domainIds;
    }

    let cursor: string | null = null;

    do {

        try {

            const ledgerStateVersion = (await sdkInstance.status.getCurrent()).ledger_state.state_version;

            const response = await sdkInstance.state.innerClient.entityNonFungibleIdsPage({
                stateEntityNonFungibleIdsPageRequest: {
                    address: accountAddress,
                    resource_address: sdkInstance.entities.resources.collections.domains,
                    vault_address: userDomainVaultAddr,
                    cursor,
                    at_ledger_state: { state_version: ledgerStateVersion }
                }
            });

            cursor = response?.next_cursor || null;
            domainIds = { ...domainIds, ...response.items };

        } catch (error) {
            console.error("Error fetching Domain NFT ID's:", error);
            break;
        }

    } while (cursor !== null);

    return domainIds;

}

async function fetchSubdomainIds(rootDomainResourceIds: string[], { sdkInstance }) {

    const batchedRootDomainIds = batchArray(rootDomainResourceIds, BATCHED_KV_STORE_LIMIT);

    const subdomainKvStoreResponses = await Promise.all(batchedRootDomainIds.map((subdomainIdBatch) => {

        return sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.domainStorage.subdomainStoreAddr,
                keys: subdomainIdBatch.map(id => ({ key_json: { kind: 'NonFungibleLocalId', value: id } }))
            }
        }).then(r => r.entries)

    }));

    const subdomainKvStoreResponse = subdomainKvStoreResponses.reduce((acc, r) => acc.concat(r), []);
    const subdomainVaultIds: string[] = subdomainKvStoreResponse.map(kvResponse => (kvResponse.value.programmatic_json as ProgrammaticScryptoSborValueOwn).value);

    const subdomainIdBatches = await Promise.all(

        subdomainVaultIds.map(subdomainVaultId => sdkInstance.state.innerClient.entityNonFungibleIdsPage({
            stateEntityNonFungibleIdsPageRequest: {
                address: sdkInstance.entities.components.domainStorage.rootAddr,
                resource_address: sdkInstance.entities.resources.collections.domains,
                vault_address: subdomainVaultId
            }

        }).then(res => res.items)));

    return subdomainIdBatches.flatMap(r => r);

}

function filterSubdomains(nftData: StateNonFungibleDetailsResponseItem[]): SubDomainI[] {

    return nftData.filter(r => {
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

            }, { id: r.non_fungible_id } as SubDomainI);
        }
    });

}

function formatDomainList(domains: StateNonFungibleDetailsResponseItem[]): DomainData[] {

    const subdomains = filterSubdomains(domains);

    return domains.filter(r => {
        return r.data?.programmatic_json.kind === 'Tuple'
            && r.data?.programmatic_json.fields.some(
                field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name === 'None'
            )
    })
        .map(r => {
            if (r.data?.programmatic_json.kind === 'Tuple') {

                return r.data?.programmatic_json.fields.reduce((acc, field) => {

                    if (field.kind === 'String' && field.field_name === 'name') {

                        const filteredSubdomain = subdomains.filter((s) => {
                            const rootDomain = deriveRootDomain(s?.name ?? '');
                            return rootDomain === field.value;
                        });

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

                    if (field.kind === 'Enum' && field.field_name === 'address') {
                        const value = field.variant_name === 'Some' ? field.fields[0].kind === 'Reference' && field.fields[0].value : null;

                        return { ...acc, [field.field_name]: value };
                    }

                    return acc;

                }, { id: r.non_fungible_id } as DomainData);
            }
        });

}

export async function requestAccountDomains(accountAddress: string, { sdkInstance }: InstancePropsI): Promise<DomainData[]> {

    if (!accountAddress) return [];

    try {

        const accountNfts = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress);

        const rootDomainResourceIds = await fetchRootDomainIds(
            accountAddress,
            accountNfts,
            { sdkInstance }
        );

        if (!rootDomainResourceIds.length) return [];

        const subdomainDomainResourceIds = await fetchSubdomainIds(
            rootDomainResourceIds,
            { sdkInstance }
        );

        const domains = await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.domains, [...rootDomainResourceIds, ...subdomainDomainResourceIds]);

        return formatDomainList(domains);


    } catch (e) {

        console.log(e);
        return [];

    }

}

export async function requestDomainDetails(domain: string, { sdkInstance }: InstancePropsI): Promise<DomainData> {

    const domainId = await domainToNonFungId(domain);

    const nftData = await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.domains, domainId);

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

        if (field.field_name === 'address' && field.kind === 'Enum') {
            const reference = field.fields.find(f => f.kind === 'Reference' && f.value) as ProgrammaticScryptoSborValueReference | undefined;

            return { ...acc, [field.field_name]: reference?.value };
        }

        return acc;
    }, { id: nftData.non_fungible_id } as DomainData);
}

