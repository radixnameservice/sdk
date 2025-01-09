import { GatewayApiClient,GatewayStatusResponse, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import config from './entities.config';
import { expandComponents } from './utils/entity.utils';
import { DomainAttributesResponse, requestDomainStatus } from './requests/domain/status';
import { ResolvedRecordResponse, requestRecords, resolveRecord } from './requests/domain/records';
import { DomainDetailsResponse, DomainData, requestAccountDomains, requestDomainDetails, CheckAuthenticityResponse } from './requests/address/domains';
import { AuctionDetailsResponse, requestAuctionDetails, requestAuctions, requestBidsForAuction } from './requests/domain/auctions';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';
import { RecordItem } from './mappings/records';
import { AllAuctionsResponse, AuctionBidResponse } from './common/auction.types';
import { EntitiesT } from './common/entities.types';

export {
    DomainAttributesResponse,
    DomainDetailsResponse,
    RecordItem,
    DomainData,
    AuctionDetailsResponse,
    AllAuctionsResponse,
    AuctionBidResponse,
    CheckAuthenticityResponse,
    ResolvedRecordResponse,
};

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
    entities: EntitiesT;

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

    async getDomainAttributes(domain: string): Promise<DomainAttributesResponse> {

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

    async getDomainDetails(domain: string): Promise<DomainDetailsResponse> {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message
            };

        }

        const details = await requestDomainDetails(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

        if (!details) {
            return null;
        }

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: details.address
        });

        if (!isAuthentic) {

            return {
                status: 'address-mismatch',
                verbose: 'The address allocated to this domain has failed the authenticity check.'
            };

        }

        return details;

    }

    async getRecords(domain: string): Promise<RecordItem[]> {

        const normalisedDomain = normaliseDomain(domain);

        return await requestRecords(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

    }

    async resolveRecord({ domain, context, directive, proven }: { domain: string; context?: string; directive?: string; proven?: boolean }): Promise<ResolvedRecordResponse> {

        const normalisedDomain = normaliseDomain(domain);

        return await resolveRecord(normalisedDomain, { context, directive, proven }, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAccountDomains(accountAddress: string): Promise<DomainData[]> {

        return await requestAccountDomains(accountAddress, { state: this.state, entities: await this.dAppEntities(), status: this.status });

    }

    async getAuction(domain: string): Promise<AuctionDetailsResponse> {

        const normalisedDomain = normaliseDomain(domain);

        return await requestAuctionDetails(normalisedDomain, { state: this.state, entities: await this.dAppEntities() });

    }

    async getAllAuctions(nextCursor?: string): Promise<AllAuctionsResponse> {

        return await requestAuctions({ state: this.state, status: this.status, entities: await this.dAppEntities() }, nextCursor);

    }

    async getBidsForAuction(auctionId: string, nextCursor?: string): Promise<AuctionBidResponse> {

        return await requestBidsForAuction(auctionId, nextCursor, { state: this.state, status: this.status, stream: this.stream, entities: await this.dAppEntities() });
    }

    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<CheckAuthenticityResponse> {

        const domainInterests = await this.getAccountDomains(accountAddress);

        if (!domainInterests || domainInterests.length < 1) {
            return {
                isAuthentic: false
            };
        }

        const isAuthentic = domainInterests.find((interestDomain) => interestDomain.name === domain)?.address === accountAddress;

        return {
            isAuthentic
        }

    }

    private async dAppEntities(): Promise<EntitiesT> {

        try {

            if (!this.entities) {

                const expandedComponents = await expandComponents(config[this.network].components, this.state);
                this.entities = { ...config[this.network], components: expandedComponents }

            }

            return this.entities;

        } catch (e) {
            console.log(e);
            return null;
        }

    }

}