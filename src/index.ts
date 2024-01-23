import { GatewayApiClient, GatewayStatusResponse, State, Status } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import config from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { requestAccountDomains } from './requests/address/domains';
import { requestAuctionDetails } from './requests/domain/auctions';

interface RnsSDKI {

    gateway?: string;
    network?: NetworkT;

}

export default class RnsSDK {

    network: NetworkT;
    state: State;
    status: Status;
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
        this.status = status;

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

    async getDomainStatus(domain: string) {

        return await requestDomainStatus(domain, { state: this.state, entities: await this.dAppEntities() });

    }

    async getRecords(domain: string) {

        return await requestRecords(domain, { state: this.state, entities: await this.dAppEntities() });

    }

    async resolveRecord({ domain, context, directive }: { domain: string; context?: string; directive?: string; }) {

        return await resolveRecord(domain, { context, directive }, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAccountDomains(accountAddress: string) {

        return await requestAccountDomains(accountAddress, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAuction(domain: string) {

        return await requestAuctionDetails(domain, { state: this.state, entities: await this.dAppEntities() });

    }

}