import {
    NonFungibleResourcesCollectionItemVaultAggregatedVaultItem,
    ProgrammaticScryptoSborValueOwn,
    ProgrammaticScryptoSborValueReference,
    ProgrammaticScryptoSborValueTuple,
    StateEntityDetailsVaultResponseItem,
    StateNonFungibleDetailsResponseItem
} from "@radixdlt/babylon-gateway-api-sdk";

import {
    deriveDomainType,
    deriveRootDomain,
    domainToNonFungId
} from "../../utils/domain.utils";

import {
    batchArray
} from "../../utils/array.utils";

import {
    logger
} from "../../utils/log.utils";

import {
    getBasePrice
} from "../../utils/pricing.utils";

import {
    DomainDataI,
    RootDomainI,
    SubDomainDataI,
    SubDomainI,
    PaginatedDomainsResponseI,
    PaginatedSubdomainsResponseI,
    PaginationInfoI,
    DomainPaginationParamsI
} from "../../common/domain.types";

import {
    InstancePropsI
} from "../../common/entities.types";

import {
    BATCHED_KV_STORE_LIMIT
} from "../../api.config";


function filterUserDomainVault(

    accountNfts: StateEntityDetailsVaultResponseItem,
    domainResourceAddr: string

): NonFungibleResourcesCollectionItemVaultAggregatedVaultItem {

    return accountNfts.non_fungible_resources.items.find(
        (nft) => nft.resource_address === domainResourceAddr
    )?.vaults.items[0];

}

async function fetchRootDomainIds(

    accountAddress: string,
    accountNfts: StateEntityDetailsVaultResponseItem,
    { sdkInstance }: InstancePropsI,
    pagination?: DomainPaginationParamsI,

): Promise<{ domainIds: string[], totalCount: number, nextCursor: number | null, previousCursor: number | null }> {

    const accountDomainVault = filterUserDomainVault(accountNfts, sdkInstance.entities.resources.collections.domains);
    if (!accountDomainVault?.items) return { domainIds: [], totalCount: 0, nextCursor: null, previousCursor: null };

    const { vault_address: userDomainVaultAddr } = accountDomainVault;
    const maxResults = pagination?.maxResultLength || 25;
    const currentPage = pagination?.page || 1;

    let totalCount = 0;
    let allDomainIds = accountDomainVault.items || [];
    let tempCursor = accountDomainVault.next_cursor || null;

    while (tempCursor) {
        try {
            const ledgerStateVersion = (await sdkInstance.status.getCurrent()).ledger_state.state_version;
            const countResponse = await sdkInstance.state.innerClient.entityNonFungibleIdsPage({
                stateEntityNonFungibleIdsPageRequest: {
                    address: accountAddress,
                    resource_address: sdkInstance.entities.resources.collections.domains,
                    vault_address: userDomainVaultAddr,
                    cursor: tempCursor,
                    at_ledger_state: { state_version: ledgerStateVersion }
                }
            });
            tempCursor = countResponse?.next_cursor || null;
            allDomainIds = [...allDomainIds, ...countResponse.items];
        } catch (error) {
            logger.error("fetchRootDomainIds count", error);
            break;
        }
    }

    totalCount = allDomainIds.length;

    const totalPages = Math.ceil(totalCount / maxResults);
    const offset = (currentPage - 1) * maxResults;

    const domainIds = allDomainIds.slice(offset, offset + maxResults);

    const nextCursor = currentPage < totalPages ? currentPage + 1 : null;
    const previousCursor = currentPage > 1 ? currentPage - 1 : null;

    return {
        domainIds,
        totalCount,
        nextCursor,
        previousCursor
    };

}

async function fetchSubdomainIds(

    rootDomainResourceIds: string[],
    { sdkInstance }

): Promise<string[] | null> {

    const batchedRootDomainIds = batchArray(rootDomainResourceIds, BATCHED_KV_STORE_LIMIT);

    try {

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

    } catch (error) {

        logger.error("fetchSubdomainIds", error);
        return null;

    }

}

function filterSubdomains(

    nftData: StateNonFungibleDetailsResponseItem[]

): SubDomainI[] {

    return nftData.filter(r => {

        return r.data?.programmatic_json.kind === 'Tuple'
            && r.data?.programmatic_json.fields.some(
                field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name !== 'None'
            );

    }).map(r => {

        if (r.data?.programmatic_json.kind === 'Tuple') {

            return r.data?.programmatic_json.fields.reduce((acc, field) => {
                if (field.kind === 'String' && field.field_name) {
                    return { ...acc, [field.field_name]: field.value };
                }

                if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
                    return { ...acc, [field.field_name]: +field.value * 1000 };
                }

                return acc;

            }, { id: r.non_fungible_id } as SubDomainI);
        }
    });

}

function formatSubdomainList(

    domains: StateNonFungibleDetailsResponseItem[]

): SubDomainI[] {

    return domains.filter(r => {

        return r.data?.programmatic_json.kind === 'Tuple'
            && r.data?.programmatic_json.fields.some(
                field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name !== 'None'
            );

    }).map(r => {
        if (r.data?.programmatic_json.kind === 'Tuple') {

            return r.data?.programmatic_json.fields.reduce((acc, field) => {

                if (field.kind === 'String' && field.field_name) {
                    return { ...acc, [field.field_name]: field.value };
                }

                if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
                    return { ...acc, [field.field_name]: +field.value * 1000 };
                }

                return acc;

            }, { id: r.non_fungible_id } as SubDomainI);
        }
    }).filter(Boolean) as SubDomainI[];

}

function formatDomainListOld(

    domains: StateNonFungibleDetailsResponseItem[]

): RootDomainI[] {

    const subdomains = formatSubdomainList(domains);

    return domains.filter(r => {

        return r.data?.programmatic_json.kind === 'Tuple'
            && r.data?.programmatic_json.fields.some(
                field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name === 'None'
            );

    }).map(r => {
        if (r.data?.programmatic_json.kind === 'Tuple') {

            return r.data?.programmatic_json.fields.reduce((acc, field) => {

                if (field.kind === 'String' && field.field_name === 'name') {

                    const filteredSubdomains = subdomains.filter((s) => {
                        const rootDomain = deriveRootDomain(s?.name ?? '');
                        return rootDomain === field.value;
                    });

                    return { ...acc, [field.field_name]: field.value, subdomains: filteredSubdomains };
                }

                if (field.kind === 'String' && field.field_name) {
                    return { ...acc, [field.field_name]: field.value };
                }

                if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
                    return { ...acc, [field.field_name]: +field.value * 1000 };
                }

                if (field.kind === 'Enum' && field.field_name === 'address') {
                    const value = field.variant_name === 'Some' ? field.fields[0].kind === 'Reference' && field.fields[0].value : null;

                    return { ...acc, [field.field_name]: value };
                }

                return acc;

            }, { id: r.non_fungible_id } as RootDomainI);
        }
    });

}

function formatDomainList(

    domains: StateNonFungibleDetailsResponseItem[]

): RootDomainI[] {

    return domains.filter(r => {

        return r.data?.programmatic_json.kind === 'Tuple'
            && r.data?.programmatic_json.fields.some(
                field => field.field_name === 'primary_domain' && field.kind === 'Enum' && field.variant_name === 'None'
            );

    }).map(r => {
        if (r.data?.programmatic_json.kind === 'Tuple') {

            return r.data?.programmatic_json.fields.reduce((acc, field) => {

                if (field.kind === 'String' && field.field_name) {
                    return { ...acc, [field.field_name]: field.value };
                }

                if (field.field_name === 'created_timestamp' && field.kind === 'I64') {
                    return { ...acc, [field.field_name]: +field.value * 1000 };
                }

                if (field.kind === 'Enum' && field.field_name === 'address') {
                    const value = field.variant_name === 'Some' ? field.fields[0].kind === 'Reference' && field.fields[0].value : null;

                    return { ...acc, [field.field_name]: value };
                }

                return acc;

            }, { id: r.non_fungible_id } as RootDomainI);
        }
    });

}

async function getSubdomainCount(

    rootDomainId: string,
    { sdkInstance }: InstancePropsI

): Promise<number> {

    try {

        const subdomainIds = await fetchSubdomainIds([rootDomainId], { sdkInstance });
        return subdomainIds?.length || 0;

    } catch (error) {

        logger.error("getSubdomainCount", error);
        return 0;

    }

}

function supplementDomainList(domains: RootDomainI[], { sdkInstance }: InstancePropsI): DomainDataI[] {

    return domains.map((domain: DomainDataI) => {

        const basePrice = getBasePrice(domain.name, sdkInstance.dependencies.rates.usdXrd);

        const price = {
            xrd: basePrice.xrd,
            usd: basePrice.usd
        };

        return {
            ...domain,
            price
        }

    });

}

async function fetchPaginatedDomainData(

    accountAddress: string,
    { sdkInstance }: InstancePropsI,
    pagination?: DomainPaginationParamsI

): Promise<PaginatedDomainsResponseI | null> {

    try {

        const accountNfts = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress);

        const { domainIds, totalCount, nextCursor, previousCursor } = await fetchRootDomainIds(
            accountAddress,
            accountNfts,
            { sdkInstance },
            pagination
        );

        if (!domainIds.length) {
            return {
                domains: [],
                pagination: {
                    next_page: null,
                    previous_page: null,
                    total_count: totalCount,
                    current_page_count: 0
                }
            };
        }

        const domains = await sdkInstance.state.getNonFungibleData(
            sdkInstance.entities.resources.collections.domains,
            domainIds
        );

        const formattedDomains = formatDomainList(domains);
        const supplementedDomains = supplementDomainList(formattedDomains, { sdkInstance });

        const domainsWithSubdomainCounts = await Promise.all(
            supplementedDomains.map(async (domain) => {
                const subdomainCount = await getSubdomainCount(domain.id, { sdkInstance });
                return {
                    ...domain,
                    subdomain_count: subdomainCount
                };
            })
        );

        const paginationInfo: PaginationInfoI = {
            next_page: nextCursor,
            previous_page: previousCursor,
            total_count: totalCount,
            current_page_count: domainsWithSubdomainCounts.length
        };

        return {
            domains: domainsWithSubdomainCounts,
            pagination: paginationInfo
        };

    } catch (error) {

        logger.error("fetchPaginatedDomainData", error);
        return null;

    }

}

export async function requestAccountDomains(

    accountAddress: string,
    { sdkInstance }: InstancePropsI,
    pagination?: DomainPaginationParamsI

): Promise<PaginatedDomainsResponseI | Error> {

    if (!accountAddress) {
        return {
            domains: [],
            pagination: {
                next_page: null,
                previous_page: null,
                total_count: 0,
                current_page_count: 0
            }
        };
    }

    try {

        return await fetchPaginatedDomainData(accountAddress, { sdkInstance }, pagination);

    } catch (e) {

        logger.error("requestAccountDomains", e);
        return e;

    }

}

export async function requestDomainDetails(

    domain: string,
    { sdkInstance }: InstancePropsI

): Promise<DomainDataI | Error> {

    try {

        const domainId = await domainToNonFungId(domain);

        const nftData = await sdkInstance.state.getNonFungibleData(
            sdkInstance.entities.resources.collections.domains,
            domainId
        );

        if (!nftData) return null;

        const subdomainDomainResourceIds = await fetchSubdomainIds(
            [domainId],
            { sdkInstance }
        );

        const subdomains = formatSubdomainList(await sdkInstance.state.getNonFungibleData(
            sdkInstance.entities.resources.collections.domains,
            [...subdomainDomainResourceIds]
        ));

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

            if (field.field_name === 'address' && field.kind === 'Enum') {
                const reference = field.fields.find(f => f.kind === 'Reference' && f.value) as ProgrammaticScryptoSborValueReference | undefined;

                return { ...acc, [field.field_name]: reference?.value };
            }

            return acc;
        }, { id: nftData.non_fungible_id, subdomains } as DomainDataI);

    } catch (e) {

        logger.error("requestDomainDetails", e);
        return e;

    }
}

export async function requestSubDomainDetails(

    subdomain: string,
    { sdkInstance }: InstancePropsI

): Promise<SubDomainDataI | Error> {

    try {

        const subdomainId = await domainToNonFungId(subdomain);

        const nftData = await sdkInstance.state.getNonFungibleData(
            sdkInstance.entities.resources.collections.domains,
            subdomainId
        );

        if (!nftData) return null;

        const domain = deriveRootDomain(subdomain);
        const rootDomainData = await requestDomainDetails(domain, { sdkInstance });

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

            return acc;
        }, { id: nftData.non_fungible_id, root_domain: rootDomainData } as SubDomainDataI);

    } catch (e) {

        logger.error("requestDomainDetails", e);
        return e;

    }
}

export async function getSubdomains(

    domain: string,
    { sdkInstance }: InstancePropsI,
    pagination?: DomainPaginationParamsI

): Promise<PaginatedSubdomainsResponseI | Error> {

    try {

        const rootDomainId = await domainToNonFungId(domain);
        const maxResults = pagination?.maxResultLength || 25;
        const currentPage = pagination?.page || 1;

        const allSubdomainIds = await fetchSubdomainIds([rootDomainId], { sdkInstance });

        if (!allSubdomainIds || allSubdomainIds.length === 0) {
            return {
                subdomains: [],
                pagination: {
                    next_page: null,
                    previous_page: null,
                    total_count: 0,
                    current_page_count: 0
                },
                root_domain_id: rootDomainId
            };
        }

        const totalCount = allSubdomainIds.length;

        const totalPages = Math.ceil(totalCount / maxResults);
        const offset = (currentPage - 1) * maxResults;

        const paginatedSubdomainIds = allSubdomainIds.slice(offset, offset + maxResults);

        const subdomainData = await sdkInstance.state.getNonFungibleData(
            sdkInstance.entities.resources.collections.domains,
            paginatedSubdomainIds
        );

        const formattedSubdomains = formatSubdomainList(subdomainData);

        const nextCursor = currentPage < totalPages ? currentPage + 1 : null;
        const previousCursor = currentPage > 1 ? currentPage - 1 : null;

        const paginationInfo: PaginationInfoI = {
            next_page: nextCursor,
            previous_page: previousCursor,
            total_count: totalCount,
            current_page_count: formattedSubdomains.length
        };

        return {
            subdomains: formattedSubdomains,
            pagination: paginationInfo,
            root_domain_id: rootDomainId
        };

    } catch (e) {

        logger.error("getSubdomains", e);
        return e;

    }

}

export async function requestDomainEntityDetails(

    domain: string,
    { sdkInstance }: InstancePropsI

): Promise<DomainDataI | SubDomainDataI | Error> {

    const isSubdomain = deriveDomainType(domain) === 'sub';

    if (isSubdomain) {
        return requestSubDomainDetails(domain, { sdkInstance });
    }

    return requestDomainDetails(domain, { sdkInstance });

}