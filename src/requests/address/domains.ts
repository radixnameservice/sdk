import { GatewayApiClient, LedgerState, ProgrammaticScryptoSborValueOwn, ProgrammaticScryptoSborValueTuple, State, Status } from "@radixdlt/babylon-gateway-api-sdk";
import { InstancePropsI } from "../../common/entities.types";
import { domainToNonFungId } from "../../utils/domain.utils";
import { BATCHED_KV_STORE_LIMIT } from "../../api.config";

export interface DomainData {
    id: string,
    name: string,
    created_timestamp: number,
    last_valid_timestamp: number,
    key_image_url: string
}

export interface CheckAuthenticityResponse {
    isAuthentic: boolean;
}

export async function requestAccountDomains(accountAddress: string, { state, entities, status }: InstancePropsI & { status: Status }) {

    if (!accountAddress) return null;

    try {

        const accountNfts = await state.getEntityDetailsVaultAggregated(accountAddress);

        const domainBalance = accountNfts.non_fungible_resources.items.find(nft => nft.resource_address === entities.domainNameResource)?.vaults.items[0];

        const initialIds = domainBalance?.items ?? [];

        const cursor = domainBalance.next_cursor;

        const ledgerState = cursor ? await status.getCurrent() : null;

        const ids = await recursiveBalanceDomainIds(state, accountAddress, domainBalance?.vault_address, entities.domainNameResource, cursor, ledgerState?.ledger_state, initialIds);

        const batchedSubdomainIds = batchArray(ids, BATCHED_KV_STORE_LIMIT);

        const subdominKvStoreResponses = await Promise.all(batchedSubdomainIds.map((ids) => state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: entities.subdomainVaults,
                keys: ids.map(id => ({ key_json: { kind: 'NonFungibleLocalId', value: id } }))
            }
        }).then(r => r.entries)));

        const subdomainKvStoreResponse = subdominKvStoreResponses.reduce((acc, r) => acc.concat(r), [])

        const subdomainVaultIds = subdomainKvStoreResponse.length
            ? subdomainKvStoreResponse.map(kvResponse => (kvResponse.value.programmatic_json as ProgrammaticScryptoSborValueOwn).value)
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
                }, { id: r.non_fungible_id } as DomainData);
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
                    }, { id: r.non_fungible_id } as DomainData);
                }
            });

    } catch (e) {

        console.log(e);
        return null;

    }

}

interface ErrorWithStatusResponse {
    status: string;
    verbose: string;
}

export type DomainDetailsResponse = DomainData | ErrorWithStatusResponse;

export async function requestDomainDetails(domain: string, { state, entities }: InstancePropsI): Promise<DomainData> {
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
    }, { id: nftData.non_fungible_id } as DomainData);
}

async function recursiveBalanceDomainIds(
    state: State,
    accountAddress: string,
    domainVaultId: string,
    domainNameResource: string,
    cursor?: string | null | undefined,
    ledgerState?: LedgerState,
    ids: string[] = []
): Promise<string[]> {
    if (!cursor) {
        return ids;
    }

    const response = await state.innerClient.entityNonFungibleIdsPage({
        stateEntityNonFungibleIdsPageRequest: {
            address: accountAddress,
            resource_address: domainNameResource,
            vault_address: domainVaultId,
            cursor,
            ...(cursor && ledgerState && { at_ledger_state: { state_version: ledgerState?.state_version } })
        }
    });

    return response.next_cursor
        ? recursiveBalanceDomainIds(state, accountAddress, domainVaultId, domainNameResource, response.next_cursor, ledgerState, [...ids, ...response.items])
        : [...ids, ...response.items];
}

export const batchArray = <T>(arr: T[], batchSize: number) => {
    const batches: T[][] = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
}

