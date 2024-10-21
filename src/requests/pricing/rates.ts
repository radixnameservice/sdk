
import { ProgrammaticScryptoSborValueOwn, State, Status } from "@radixdlt/babylon-gateway-api-sdk";
import Decimal from "decimal.js";

import { convertToDecimal } from "../../utils/decimal.utils";

import { AddressMapT } from "../../common/entities.types";

export async function requestXRDExchangeRate({ state, status, entities }: { state: State, status: Status, entities: AddressMapT }): Promise<Decimal> {

    try {

        const tokenUsdPrice = ((await state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: entities.tokenUsdPriceKvStore,
                keys: [{ key_json: { kind: 'Reference', value: (await status.getNetworkConfiguration()).well_known_addresses.xrd } }]
            }
        })).entries[0]?.value.programmatic_json as ProgrammaticScryptoSborValueOwn)?.value;

        return convertToDecimal(tokenUsdPrice);

    } catch (e) {

        console.log(e);
        return null;

    }

}