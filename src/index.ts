import { GatewayApiClient, GatewayStatusResponse, State } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import config from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { domainToNonFungId } from './utils/domain.utils';

interface RnsSDKI {

    gateway?: string;
    network?: NetworkT;

}

export default class RnsSDK {

    network: NetworkT;
    state: State;
    entities: any;

    constructor({ gateway, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.initGateway({ gateway });

    }

    initGateway({ gateway }: { gateway?: string; }): Promise<GatewayStatusResponse> {

        const { status, state } = GatewayApiClient.initialize({
            basePath: gateway ?? getBasePath(this.network),
            applicationName: 'The Radix Name Service'
        });

        this.state = state;

        return status.getCurrent();

    }

    async dAppEntities() {

        try {

            if (!this.entities) {
                this.entities = parseEntityDetails(await this.state.getEntityDetailsVaultAggregated(config[this.network].entities, { explicitMetadata: ['name'] }), this.state);
            }

            return this.entities;

        } catch (e) {
            console.log(e);
            return null;
        }

    }

    async getDomainStatus(domainName: string) {

        return await requestDomainStatus(domainName, { state: this.state, entities: await this.dAppEntities() });

    }

    async getRecords(domainName: string) {

        return await requestRecords(domainName, { state: this.state, entities: await this.dAppEntities() });

    }

    async resolveRecord(domainName: string, context?: string, directive?: string, platformIdentifier?: string) {
        const domainId = await domainToNonFungId(domainName);
        const parsedContext = context ? `-${context}` : '';
        const parsedDirective = directive? `-${directive}` : '';
        const parsedPlatformIdentifier = platformIdentifier? `-${platformIdentifier}` : '';
        const recordId = await domainToNonFungId(`${domainId}${parsedContext}${parsedDirective}${parsedPlatformIdentifier}`);

        return await resolveRecord(recordId, { state: this.state, entities: await this.dAppEntities() });
    }

}

(async () => {

    const rns = new RnsSDK({
        network: 'stokenet'
    });

    const status = await rns.getDomainStatus('wylie.xrd');
    const records = await rns.getRecords('james2.xrd');
    const resolvedRecord = await rns.resolveRecord('sooomlooongdomainboidamn.xrd', 'navigation', undefined, 'xrd.domains:navigation.web3');

})();
