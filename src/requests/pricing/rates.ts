
import Decimal from "decimal.js";
import { ProgrammaticScryptoSborValueOwn } from "@radixdlt/babylon-gateway-api-sdk";

import { convertToDecimal } from "../../utils/decimal.utils";

import { InstancePropsI } from "../../common/entities.types";


export async function requestXRDExchangeRate({ sdkInstance }: InstancePropsI): Promise<Decimal> {

    try {

        const tokenUsdPrice = ((await sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.feeService.xrdToUsdRateAddr,
                keys: [{ key_json: { kind: 'Reference', value: (await sdkInstance.status.getNetworkConfiguration()).well_known_addresses.xrd } }]
            }
        })).entries[0]?.value.programmatic_json as ProgrammaticScryptoSborValueOwn)?.value;

        return convertToDecimal(tokenUsdPrice);

    } catch (e) {

        console.log(e);
        return null;

    }

}