import { GatewayApiClient, GatewayStatusResponse, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import config from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { requestAccountDomains, requestDomainDetails } from './requests/address/domains';
import { requestAuctionDetails, requestAuctions, requestBidsForAuction } from './requests/domain/auctions';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';

interface RnsSDKI {

    gateway?: string;
    network?: NetworkT;

}

export default class RnsSDK {

    network: NetworkT;
    state: State;
    transaction: Transaction;
    status: Status;
    stream: Stream;
    entities: any;

    constructor({ gateway, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.initGateway({ gateway });

    }

    initGateway({ gateway }: { gateway?: string; }): Promise<GatewayStatusResponse> {

        const { status, state, transaction, stream } = GatewayApiClient.initialize({
            basePath: gateway ?? getBasePath(this.network),
            applicationName: 'The Radix Name Service'
        });

        this.state = state;
        this.status = status;
        this.transaction = transaction;
        this.stream = stream;

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

    async getDomainAttributes(domain: string) {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message
            };

        }

        return await requestDomainStatus(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

    }

    async getDomainDetails(domain: string) {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message
            };

        }

        return await requestDomainDetails(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

    }

    async getRecords(domain: string) {

        const normalisedDomain = normaliseDomain(domain);

        return await requestRecords(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

    }

    async resolveRecord({ domain, context, directive }: { domain: string; context?: string; directive?: string; }) {

        const normalisedDomain = normaliseDomain(domain);

        return await resolveRecord(normalisedDomain, { context, directive }, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAccountDomains(accountAddress: string) {

        return await requestAccountDomains(accountAddress, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAuction(domain: string) {

        const normalisedDomain = normaliseDomain(domain);

        return await requestAuctionDetails(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAllAuctions(nextCursor?: string) {

        return await requestAuctions({ state: this.state, status: this.status, entities: await this.dAppEntities() }, nextCursor);

    }

    async getBidsForAuction(auctionId: string, nextCursor?: string) {

        return await requestBidsForAuction(auctionId, nextCursor, { state: this.state, status: this.status, stream: this.stream, entities: await this.dAppEntities() });
    }

    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }) {

        const domainInterests = await this.getAccountDomains(accountAddress);

        if (!domainInterests || domainInterests.length < 1) {
            return {
                isAuthentic: false
            };
        }

        for (let i = 0; i < domainInterests.length; i++) {

            const interestDomain = domainInterests[i];

            if (interestDomain.name === domain) {
                return {
                    isAuthentic: true
                };
            }

        }

        return {
            isAuthentic: false
        };

    }

}
