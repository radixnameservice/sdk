import { GatewayApiClient, GatewayStatusResponse, State } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import config from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { AddressMapT } from './mappings/entities';
import { getDomainProperties } from './utils/domain.utils';

interface RnsSDKI {

    gateway?: string;
    network?: NetworkT;

}

export default class RnsSDK {

    network: NetworkT;
    state: State;
    entities: AddressMapT;

    constructor({ gateway, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.initGateway({ gateway });
        this.getdAppEntities();

    }

    initGateway({ gateway }: { gateway?: string; }): Promise<GatewayStatusResponse> {

        const { status, state } = GatewayApiClient.initialize({
            basePath: gateway ?? getBasePath(this.network),
            applicationName: 'The Radix Name Service'
        });

        this.state = state;

        return status.getCurrent();

    }

    async getdAppEntities() {

        try {
            this.entities = parseEntityDetails(await this.state.getEntityDetailsVaultAggregated(config[this.network].entities, { explicitMetadata: ['name'] }));
        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async getDomainStatus(domainName: string) {

        return await getDomainProperties(domainName, { state: this.state, entities: this.entities });

    }

}

// (async () => {

//     const rns = new RnsSDK({
//         network: 'stokenet'
//     });

//     const status = rns.getDomainStatus('beem.xrd');

// })();