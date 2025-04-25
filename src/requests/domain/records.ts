import { ProgrammaticScryptoSborValueOwn } from "@radixdlt/babylon-gateway-api-sdk";

import { requestDomainDetails } from "../address/domains";
import { domainToNonFungId } from "../../utils/domain.utils";
import { docketToRecordId, isProvenRecord } from "../../utils/record.utils";

import { InstancePropsI } from "../../common/entities.types";
import { DocketPropsI, RecordItemI } from "../../common/record.types";
import { ResolvedRecordI } from "../../common/response.types";


export async function requestRecords(domainName: string, { sdkInstance }: InstancePropsI): Promise<RecordItemI[] | [] | Error> {

    try {

        const domainId = await domainToNonFungId(domainName);

        const recordsVaultId = ((await sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.domainStorage.recordServiceStoreAddr,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: domainId } }]
            }
        })).entries[0]?.value.programmatic_json as ProgrammaticScryptoSborValueOwn)?.value;

        if (!recordsVaultId) {
            return [];
        }

        const recordIds = (await sdkInstance.state.innerClient.entityNonFungibleIdsPage({
            stateEntityNonFungibleIdsPageRequest: {
                address: sdkInstance.entities.components.domainStorage.rootAddr,
                resource_address: sdkInstance.entities.resources.collections.records,
                vault_address: recordsVaultId,
            }
        })).items;

        return (await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.records, recordIds))
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

                        if (field.field_name === 'value' && field.kind === 'Enum') {
                            const value = (('fields' in field && 'value' in field.fields[0] && field.fields[0].value) || null) as string | null;
                            return { ...acc, [field.field_name]: value, proven: isProvenRecord(value.toString()) }
                        }

                        if (field.kind === 'String' || field.kind === 'NonFungibleLocalId') {
                            if (field.field_name) {
                                return { ...acc, [field.field_name]: field.value };
                            }
                        }

                        return acc;
                    }, { record_id: nft.non_fungible_id } as RecordItemI)
                }
                return {} as RecordItemI;
            });

    } catch (e) {

        return e;

    }

}

export async function resolveRecord(domain: string, { context, directive, proven }: DocketPropsI, { sdkInstance }: InstancePropsI): Promise<ResolvedRecordI | null | Error> {

    try {

        const recordId = await docketToRecordId(domain, { context, directive });

        const nft = await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.records, recordId);

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

            const domainDetails = await requestDomainDetails(domain, { sdkInstance });

            if (domainDetails instanceof Error) {
                throw domainDetails;
            }

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

            const fungibleResources = provenResourcesList.filter(r => !r.ids).map(r => r.resourceAddress);

            const accountNonFungibleVaultIds = await sdkInstance.state.getEntityDetailsVaultAggregated(accountAddress).then(r => {
                const nonFungibleVaultIds = new Set(r.non_fungible_resources.items.map(v => v.vaults.items[0].vault_address));

                const areAllResourcesProven = fungibleResources.every(resource => r.fungible_resources.items.find(v => v.resource_address === resource && parseFloat(v.vaults.items[0].amount) > 0));

                if (!areAllResourcesProven) {
                    return null;
                }

                return new Set(nonFungibleVaultIds);
            });

            const nonFungibleLocationResponse = await Promise.all(provenResourcesList.filter(r => r.ids).map(resource => sdkInstance.state.getNonFungibleLocation(resource.resourceAddress, resource.ids)));

            const requiredVaultIds = [...new Set(nonFungibleLocationResponse.flatMap(r => r).map(r => r.owning_vault_address))];

            const areAllNftsProven = requiredVaultIds.every(vaultId => accountNonFungibleVaultIds.has(vaultId));

            if (!areAllNftsProven) {
                return null;
            }

            const nftDataList = await Promise.all(provenResourcesList.map(r => sdkInstance.state.getNonFungibleData(r.resourceAddress, r.ids)));

            return { value, nonFungibleDataList: nftDataList.flatMap(r => r) };
        }

        return null;

    } catch (e) {

        console.log(e);
        return e;

    }

}
