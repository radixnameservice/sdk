export enum Network {
    mainnet = 'https://mainnet.radixdlt.com',
    stokenet = 'https://stokenet.radixdlt.com'
}

export type NetworkT = 'mainnet' | 'stokenet';

export function getBasePath(network: NetworkT = 'mainnet') {

    return Network[network];

}