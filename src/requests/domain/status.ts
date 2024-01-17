import { InstancePropsI } from "../../common/entities.types";
import { determineStatus, domainToNonFungId } from "../../utils/domain.utils";

export async function requestDomainStatus(domainName: string, instance: InstancePropsI) {

    const domainId = await domainToNonFungId(domainName);

    try {

        const settlementStore = await instance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: instance.entities.settlementVaultId,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: `[${domainId}]` } }]
            }
        });

        return await determineStatus(settlementStore, instance);

    } catch (e) {

        console.log(e);
        return null;

    }

}