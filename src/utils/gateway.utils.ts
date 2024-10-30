import { NetworkConfigurationResponseWellKnownAddresses, Status } from "@radixdlt/babylon-gateway-api-sdk";
import { ucWords } from "./string.utils";

export enum Network {
    Mainnet = 'https://mainnet.radixdlt.com',
    Stokenet = 'https://stokenet.radixdlt.com'
}

export type NetworkT = 'mainnet' | 'stokenet';

export function getBasePath(network: NetworkT = 'mainnet') {
    return Network[ucWords(network)];
}

export async function getWellKnownAddresses(status: Status): Promise<NetworkConfigurationResponseWellKnownAddresses> {

    return (await status.getNetworkConfiguration()).well_known_addresses;

}