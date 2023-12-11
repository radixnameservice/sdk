import { ProgrammaticScryptoSborValueOwn } from "@radixdlt/babylon-gateway-api-sdk";
import { InstancePropsI } from "../../common/types";
import { domainToNonFungId } from "../../utils/domain.utils";

export async function requestRecords(domainName: string, instance: InstancePropsI) {

    const domainId = await domainToNonFungId(domainName);

    const recordsVaultId = ((await instance.state.innerClient.keyValueStoreData({
        stateKeyValueStoreDataRequest: {
            key_value_store_address: instance.entities.recordServiceVaultId,
            keys: [{ key_json: { kind: 'NonFungibleLocalId', value: domainId } }]
        }
    })).entries[0]?.value.programmatic_json as ProgrammaticScryptoSborValueOwn)?.value;

    if (!recordsVaultId) {
        return [];
    }

    const recordIds = (await instance.state.innerClient.entityNonFungibleIdsPage({

        stateEntityNonFungibleIdsPageRequest: {
            address: instance.entities.radixNameServiceComponent,
            resource_address: instance.entities.resolverRecordResource,
            vault_address: recordsVaultId,
        }

    })).items;

    return (await instance.state.getNonFungibleData(instance.entities.resolverRecordResource, recordIds))
        .map(nft => {
            if (nft.data?.programmatic_json.kind === 'Tuple') {
                return nft.data?.programmatic_json.fields.reduce((acc, field) => {
                    if (field.type_name === 'RecordType' && field.kind === 'Enum') {
                        if (field.field_name) {
                            return { ...acc, [field.field_name]: field.variant_name }
                        }
                    }

                    if (field.kind === 'String' || field.kind === 'NonFungibleLocalId') {
                        if (field.field_name) {
                            return { ...acc, [field.field_name]: field.value };
                        }
                    }
                    return acc;
                }, {})
            }
        });

}