import { NetworkConfigurationResponseWellKnownAddresses, Status } from "@radixdlt/babylon-gateway-api-sdk";
import { ucWords } from "./string.utils";
import { Network } from "../mappings/gateway";

import { NetworkT } from "../common/gateway.types";


export function getBasePath(network: NetworkT = 'mainnet') {
    return Network[ucWords(network)];
}

export async function getWellKnownAddresses(status: Status): Promise<NetworkConfigurationResponseWellKnownAddresses> {

    return (await status.getNetworkConfiguration()).well_known_addresses;

}