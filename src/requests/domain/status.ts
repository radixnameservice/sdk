import { InstancePropsI } from "../../common/entities.types";
import { determineStatus, domainToNonFungId } from "../../utils/domain.utils";

export async function requestDomainStatus(domainName: string, { state, entities }: InstancePropsI) {

    const domainId = await domainToNonFungId(domainName);

    try {

        const settlementStore = await state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: entities.settlementVaultId,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: `[${domainId}]` } }]
            }
        });

        return await determineStatus(settlementStore, { state, entities });

    } catch (e) {

        console.log(e);
        return null;

    }

}