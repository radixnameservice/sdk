import { GatewayApiClient, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';

import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { DomainDetailsResponse, requestAccountDomains, requestDomainDetails } from './requests/address/domains';
import { requestAuctionDetails, requestAuctions, requestBidsForAuction } from './requests/domain/auctions';
import { requestXRDExchangeRate } from './requests/pricing/rates';
import { dispatchDomainRegistration } from './dispatchers/domain/registration';

import entityConfig from './entities.config';

import { parseEntityDetails } from './utils/entity.utils';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';

import { RegistrationResponse } from './common/dispatcher.types';
import { UserSpecificsI } from './common/user.types';
import { EventCallbacksI } from './common/transaction.types';
import { AddressMapT } from './common/entities.types';
import { RecordItem, ResolvedRecordResponse } from './common/records.types';
import { DependenciesI } from './common/dependencies.types';
import { CheckAuthenticityResponse, DomainAttributesResponse, DomainData } from './common/domain.types';
import { AllAuctionsResponse, AuctionBidResponse, AuctionDetailsResponse } from './common/auction.types';

export {
    DomainAttributesResponse,
    DomainDetailsResponse,
    RecordItem,
    DomainData,
    AllAuctionsResponse,
    AuctionBidResponse,
    CheckAuthenticityResponse,
    ResolvedRecordResponse,
    AuctionDetailsResponse,
    RegistrationResponse
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
        this.fetchDependencies();

    }

    async fetchDependencies(): Promise<void> {

        await this.dAppEntities();
        await this.dAppDependencies();

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
            throw new Error('RNS SDK: The RNS SDK is not fully initialized.');
        }
    }

    async getDomainAttributes(domain: string): Promise<DomainAttributesResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message,
                price: null
            };

        }

        return requestDomainStatus(normalisedDomain, { sdkInstance: this });

    }

    async getDomainDetails(domain: string): Promise<DomainDetailsResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid) {

            return {
                status: 'invalid',
                verbose: domainValidation.message
            };

        }

        const details = await requestDomainDetails(normalisedDomain, { sdkInstance: this });

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
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);

        return requestRecords(normalisedDomain, { sdkInstance: this });

    }

    async resolveRecord({ domain, context, directive, proven }: { domain: string; context?: string; directive?: string; proven?: boolean }): Promise<ResolvedRecordResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);

        return resolveRecord(normalisedDomain, { context, directive, proven }, { sdkInstance: this });

    }

    async getAccountDomains(accountAddress: string): Promise<DomainData[]> {

        this.checkInitialized();
        await this.fetchDependencies();

        return requestAccountDomains(accountAddress, { sdkInstance: this });

    }

    async getAuction(domain: string): Promise<AuctionDetailsResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);

        return requestAuctionDetails(normalisedDomain, { sdkInstance: this });

    }

    async getAllAuctions(nextCursor?: string): Promise<AllAuctionsResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return requestAuctions({ sdkInstance: this }, nextCursor);

    }

    async getBidsForAuction(auctionId: string, nextCursor?: string): Promise<AuctionBidResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return requestBidsForAuction(auctionId, nextCursor, { sdkInstance: this });

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
        };

    }

    async registerDomain({ domain, durationYears = 1, rdt, userDetails, callbacks }: { domain: string; durationYears?: number; rdt: RadixDappToolkit; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<RegistrationResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return dispatchDomainRegistration({
            sdkInstance: this,
            domain,
            durationYears,
            rdt,
            userDetails,
            callbacks
        });

    }

    private async dAppEntities(): Promise<AddressMapT> {

        try {

            if (!this.entities) {
                this.entities = await parseEntityDetails(await this.state.getEntityDetailsVaultAggregated(entityConfig[this.network].entities, { explicitMetadata: ['name'] }), this.state);
            }

            return this.entities;

        } catch (error) {

            throw new Error(`RNS SDK: Could not fetch RNS (dApp component) entities: ${error}`);

        }

    }

    private async dAppDependencies(): Promise<DependenciesI> {

        try {

            if (!this.dependencies) {

                this.dependencies = {
                    rates: {
                        usdXrd: await requestXRDExchangeRate({
                            sdkInstance: this
                        }),
                    },
                };

            }

            return this.dependencies;

        } catch (error) {

            throw new Error(`RNS SDK: Could not fetch RNS (dApp component) dependencies: ${error}`);

        }

    }

}
