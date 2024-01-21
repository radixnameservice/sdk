import { ProgrammaticScryptoSborValueOwn } from "@radixdlt/babylon-gateway-api-sdk";
import { InstancePropsI } from "../../common/entities.types";
import { domainToNonFungId } from "../../utils/domain.utils";
import { RecordItem } from "../../mappings/records";

export async function requestRecords(domainName: string, { state, entities }: InstancePropsI) {

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
                        const value = (('fields' in field.fields[0] && 'value' in field.fields[0].fields[0] && field.fields[0].fields[0].value) || null) as string | null;

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

}

export async function resolveRecord(recordId: string, { state, entities }: InstancePropsI) {

    const nft = await state.getNonFungibleData(entities.resolverRecordResource, recordId);

    if (nft?.data?.programmatic_json.kind === 'Tuple') {

        return nft.data?.programmatic_json.fields.filter(field => {
            return (field.field_name === 'value' && field.kind === 'Enum')
        }).map((field) => {
            if (field.field_name === 'value' && field.kind === 'Enum') {
                const value = (('fields' in field.fields[0] && 'value' in field.fields[0].fields[0] && field.fields[0].fields[0].value) || null) as string | null;
                return value;
            }
        })[0];

    }

    return null;

}
