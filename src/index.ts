import { GatewayApiClient, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import entityConfig from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { DomainDetailsResponse, requestAccountDomains, requestDomainDetails } from './requests/address/domains';
import { requestAuctionDetails, requestAuctions, requestBidsForAuction } from './requests/domain/auctions';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';
import { AllAuctionsResponse, AuctionBidResponse, AuctionDetailsResponse } from './common/auction.types';
import { AddressMapT } from './mappings/entities';
import { DependenciesI } from './common/dependencies.types';
import { requestXRDExchangeRate } from './requests/pricing/rates';
import { CheckAuthenticityResponse, DomainAttributesResponse, DomainData } from './common/domain.types';
import { RecordItem, ResolvedRecordResponse } from './common/records.types';

export {
    DomainAttributesResponse,
    DomainDetailsResponse,
    RecordItem,
    DomainData,
    AllAuctionsResponse,
    AuctionBidResponse,
    CheckAuthenticityResponse,
    ResolvedRecordResponse,
    AuctionDetailsResponse
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
    entities: AddressMapT;
    dependencies: DependenciesI;

    constructor({ gateway, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.initGateway({ gateway });
        this.preload();

    }

    async preload(): Promise<void> {

        await this.dAppEntities(); // Preload entities
        await this.dAppDependencies(); // Preload dependencies

    }

    initGateway({ gateway }: { gateway?: string; }): void {

        const { status, state, transaction, stream } = GatewayApiClient.initialize({
            basePath: gateway ?? getBasePath(this.network),
            applicationName: 'The Radix Name Service'
        });

        this.state = state;
        this.status = status;
        this.transaction = transaction;
        this.stream = stream;

    }

    private checkInitialized(): void {
        if (!this.state || !this.status || !this.transaction || !this.stream) {
            throw new Error('The RNS SDK is not fully initialized.');
        }
    }

    async getDomainAttributes(domain: string): Promise<DomainAttributesResponse> {

        this.checkInitialized();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message,
                price: null
            };

        }

        return await requestDomainStatus(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

    }

    async getDomainDetails(domain: string): Promise<DomainDetailsResponse> {

        this.checkInitialized();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message
            };

        }

        const details = await requestDomainDetails(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

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

        this.checkInitialized();

        const normalisedDomain = normaliseDomain(domain);

        return await requestRecords(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

    }

    async resolveRecord({ domain, context, directive, proven }: { domain: string; context?: string; directive?: string; proven?: boolean }): Promise<ResolvedRecordResponse> {

        this.checkInitialized();

        const normalisedDomain = normaliseDomain(domain);

        return await resolveRecord(normalisedDomain, { context, directive, proven }, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

    }

    async getAccountDomains(accountAddress: string): Promise<DomainData[]> {

        this.checkInitialized();

        return await requestAccountDomains(accountAddress, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

    }

    async getAuction(domain: string): Promise<AuctionDetailsResponse> {

        this.checkInitialized();

        const normalisedDomain = normaliseDomain(domain);

        return await requestAuctionDetails(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

    }

    async getAllAuctions(nextCursor?: string): Promise<AllAuctionsResponse> {

        this.checkInitialized();

        return await requestAuctions({ state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() }, nextCursor);

    }

    async getBidsForAuction(auctionId: string, nextCursor?: string): Promise<AuctionBidResponse> {

        this.checkInitialized();

        return await requestBidsForAuction(auctionId, nextCursor, { state: this.state, status: this.status, stream: this.stream, entities: await this.dAppEntities(), dependencies: await this.dAppDependencies() });

    }

    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<CheckAuthenticityResponse> {

        this.checkInitialized();

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

    private async dAppEntities(): Promise<AddressMapT> {

        try {

            if (!this.entities) {
                this.entities = await parseEntityDetails(await this.state.getEntityDetailsVaultAggregated(entityConfig[this.network].entities, { explicitMetadata: ['name'] }), this.state);
            }

            return this.entities;

        } catch (error) {

            throw new Error(`Could not fetch RNS (dApp component) entities: ${error}`);

        }

    }

    private async dAppDependencies(): Promise<DependenciesI> {

        try {

            if (!this.dependencies) {

                this.dependencies = {
                    rates: {
                        usdXrd: await requestXRDExchangeRate({
                            state: this.state,
                            status: this.status,
                            entities: this.entities,
                        }),
                    },
                };

            }

            return this.dependencies;

        } catch (error) {

            throw new Error(`Could not fetch RNS (dApp component) dependencies: ${error}`);

        }

    }

}
