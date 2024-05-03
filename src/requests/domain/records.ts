import { ProgrammaticScryptoSborValueOwn, StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";
import { InstancePropsI } from "../../common/entities.types";
import { domainToNonFungId } from "../../utils/domain.utils";
import { RecordItem } from "../../mappings/records";
import { requestDomainDetails } from "../address/domains";

export async function requestRecords(domainName: string, { state, entities }: InstancePropsI) {

    try {

        const domainId = await domainToNonFungId(domainName);

        const recordsVaultId = ((await state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: entities.recordServiceVaultId,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: domainId } }]
            }
        })).entries[0]?.value.programmatic_json as ProgrammaticScryptoSborValueOwn)?.value;

        if (!recordsVaultId) {
            return [];
        }

        const recordIds = (await state.innerClient.entityNonFungibleIdsPage({
            stateEntityNonFungibleIdsPageRequest: {
                address: entities.rnsStorage,
                resource_address: entities.resolverRecordResource,
                vault_address: recordsVaultId,
            }
        })).items;

        return (await state.getNonFungibleData(entities.resolverRecordResource, recordIds))
            .map(nft => {
                if (nft.data?.programmatic_json.kind === 'Tuple') {
                    return nft.data?.programmatic_json.fields.reduce((acc, field) => {
                        if (field.type_name === 'RecordType' && field.kind === 'Enum') {
                            if (field.field_name) {
                                return { ...acc, [field.field_name]: field.variant_name }
                            }
                        }

                        if (field.type_name === 'Option' && field.kind === 'Enum' && field.field_name !== 'value') {
                            if (field.field_name) {
                                const value = (field.fields.length && 'value' in field.fields[0]) ? field.fields[0].value : null;

                                return { ...acc, [field.field_name]: value }
                            }
                        }

                        if (field.field_name === 'id_additions' && field.kind === 'Array') {
                            return { ...acc, [field.field_name]: field.elements.map(e => ('value' in e && e.value) as string) }
                        }

                        if (field.field_name === 'value' && field.kind === 'Enum') {
                            const value = (('fields' in field && 'value' in field.fields[0] && field.fields[0].value) || null) as string | null;
                            return { ...acc, [field.field_name]: value }
                        }

                        if (field.kind === 'String' || field.kind === 'NonFungibleLocalId') {
                            if (field.field_name) {
                                return { ...acc, [field.field_name]: field.value };
                            }
                        }

                        return acc;
                    }, { record_id: nft.non_fungible_id } as RecordItem)
                }
                return {} as RecordItem;
            });

    } catch (e) {

        console.log(e);
        return null;

    }

}

interface DocketPropsI {

    context?: string;
    directive?: string;
    proven?: boolean;

}

export interface ResolvedRecordResponse {
    value: string,
    nonFungibleDataList?: StateNonFungibleDetailsResponseItem[],
}

export async function resolveRecord(domain: string, { context, directive, proven }: DocketPropsI, { state, entities }: InstancePropsI): Promise<ResolvedRecordResponse> {

    try {

        const domainId = await domainToNonFungId(domain);
        const parsedContext = context ? `-${context}` : '';
        const parsedDirective = directive ? `-${directive}` : '';
        const recordId = await domainToNonFungId(`${domainId}${parsedContext}${parsedDirective}`);

        const nft = await state.getNonFungibleData(entities.resolverRecordResource, recordId);

        if (nft?.data?.programmatic_json.kind === 'Tuple') {

            const value = nft.data?.programmatic_json.fields.filter(field => {
                return (field.field_name === 'value' && field.kind === 'Enum')
            }).map((field) => {
                if (field.field_name === 'value' && field.kind === 'Enum') {
                    const value = (('fields' in field && field.fields.length && 'value' in field.fields[0] && field.fields[0].value) || null) as string | null;
                    return value;
                }
            })[0];

            if (!proven) {
                return { value };
            }

            if (!value.startsWith('(') || !value.endsWith(')')) {
                return null;
            }

            const provenResources = value.match(/\(\"(.+)\"\)/);

            if (!provenResources) {
                return null;
            }

            const domainDetails = await requestDomainDetails(domain, { state, entities });

            const accountAddress = domainDetails.address;

            const provenResourcesList: { resourceAddress: string, ids?: string[] }[] = provenResources[1].split(',').reduce((acc, resource) => {
                const [resourceAddress, id] = resource.split(':');

                const foundResourceIndex = acc.findIndex(a => a.resourceAddress === resourceAddress);

                if (foundResourceIndex === -1) {
                    acc.push({ resourceAddress, ...(id && { ids: [id] }) });
                    return acc;
                } else {
                    if (id) {
                        acc[foundResourceIndex].ids.push(id);
                    }

                    return acc;
                }

            }, []);

            const fungibleResources = provenResourcesList.filter(r =>!r.ids).map(r => r.resourceAddress);

            const accountNonFungibleVaultIds = await state.getEntityDetailsVaultAggregated(accountAddress).then(r => {
                const nonFungibleVaultIds = new Set(r.non_fungible_resources.items.map(v => v.vaults.items[0].vault_address));

                const areAllResourcesProven = fungibleResources.every(resource => r.fungible_resources.items.find(v => v.resource_address === resource && parseFloat(v.vaults.items[0].amount) > 0));

                if (!areAllResourcesProven) {
                    return null;
                }

                return new Set(nonFungibleVaultIds);
            });

            const nonFungibleLocationResponse = await Promise.all(provenResourcesList.filter(r => r.ids).map(resource => state.getNonFungibleLocation(resource.resourceAddress, resource.ids)));

            const requiredVaultIds = [...new Set(nonFungibleLocationResponse.flatMap(r => r).map(r => r.owning_vault_address))];

            const areAllNftsProven = requiredVaultIds.every(vaultId => accountNonFungibleVaultIds.has(vaultId));

            if (!areAllNftsProven) {
                return null;
            }

            const nftDataList = await Promise.all(provenResourcesList.map(r => state.getNonFungibleData(r.resourceAddress, r.ids)));

            return { value, nonFungibleDataList: nftDataList.flatMap(r => r) };
        }

        return null;

    } catch (e) {

        console.log(e);
        return null;

    }

}
