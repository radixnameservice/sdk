import { GatewayApiClient, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';

import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { requestAccountDomains, requestDomainDetails } from './requests/address/domains';
import { requestAuctionDetails, requestAuctions, requestBidsForAuction } from './requests/domain/auctions';
import { requestXRDExchangeRate } from './requests/pricing/rates';
import { getUserBadgeId } from './requests/user/badges';
import { dispatchDomainRegistration } from './dispatchers/domain/registration';
import { dispatchUserBadgeIssuance } from './dispatchers/user/badge-management';
import { dispatchRecordCreation } from './dispatchers/record/creation';
import { dispatchDomainActivation } from './dispatchers/domain/activation';

import config from './entities.config';
import { commonErrors } from './common/errors';

import { expandComponents } from './utils/entity.utils';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';
import { errorResponse } from './utils/response.utils';

import { UserSpecificsI } from './common/user.types';
import { EventCallbacksI } from './common/transaction.types';

import { RecordItem } from './common/record.types';
import { DependenciesI } from './common/dependencies.types';
import { DomainData } from './common/domain.types';
import { DocketI } from './common/record.types';
import { AccountDomainsResponse, AllAuctionsResponse, AuctionBidResponse, AuctionDetailsResponse, CheckAuthenticityResponse, CommitmentStackResponse, DomainAttributesResponse, ErrorStackResponse, ResolvedRecordResponse, UserBadgeResponse } from './common/response.types';
import { EntitiesT } from './common/entities.types';


export {
    DomainAttributesResponse,
    RecordItem,
    DomainData,
    AllAuctionsResponse,
    AuctionBidResponse,
    CheckAuthenticityResponse,
    ResolvedRecordResponse,
    AuctionDetailsResponse,
    UserBadgeResponse,
    CommitmentStackResponse,
    ErrorStackResponse
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
    dependencies: DependenciesI;

    constructor({ gateway, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.initGateway({ gateway });
        this.fetchDependencies();

    }

    private async fetchDependencies(): Promise<void> {

        await this.dAppEntities();
        await this.dAppDependencies();

    }

    private initGateway({ gateway }: { gateway?: string; }): void {

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

    async getDomainAttributes(domain: string): Promise<DomainAttributesResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorResponse(commonErrors.invalidDomain({ domain, verbose: domainValidation.message }));

        return requestDomainStatus(normalisedDomain, { sdkInstance: this });

    }

    async getDomainDetails(domain: string): Promise<DomainData | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorResponse(commonErrors.invalidDomain({ domain, verbose: domainValidation.message }));

        const details = await requestDomainDetails(normalisedDomain, { sdkInstance: this });

        if (!details)
            return errorResponse(commonErrors.emptyDomainDetails({ domain }));

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorResponse(commonErrors.authenticityMismatch({ domain }));

        return details;

    }

    async getRecords(domain: string): Promise<RecordItem[] | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorResponse(commonErrors.invalidDomain({ domain, verbose: domainValidation.message }));

        const details = await requestDomainDetails(normalisedDomain, { sdkInstance: this });

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorResponse(commonErrors.authenticityMismatch({ domain }));


        return requestRecords(normalisedDomain, { sdkInstance: this });

    }

    async resolveRecord({ domain, context, directive, proven }: { domain: string; context?: string; directive?: string; proven?: boolean }): Promise<ResolvedRecordResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorResponse(commonErrors.invalidDomain({ domain, verbose: domainValidation.message }));

        const details = await requestDomainDetails(normalisedDomain, { sdkInstance: this });

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorResponse(commonErrors.authenticityMismatch({ domain }));

        return resolveRecord(normalisedDomain, { context, directive, proven }, { sdkInstance: this });

    }

    async getAccountDomains(accountAddress: string): Promise<AccountDomainsResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const accountDomains = requestAccountDomains(accountAddress, { sdkInstance: this });

        if (!accountDomains)
            return errorResponse(commonErrors.accountRetrieval({ accountAddress, verbose: `An error occured when requesting user account domains from: ${accountAddress}.` }));

        return accountDomains;

    }

    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<CheckAuthenticityResponse | ErrorStackResponse> {

        this.checkInitialized();

        const domainInterests = await this.getAccountDomains(accountAddress);

        if ('errors' in domainInterests)
            return domainInterests;

        const isAuthentic = domainInterests.find((interestDomain) => interestDomain.name === domain)?.address === accountAddress;

        return {
            isAuthentic
        };

    }

    async registerDomain({ domain, durationYears = 1, rdt, userDetails, callbacks }: { domain: string; durationYears?: number; rdt: RadixDappToolkit; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return dispatchDomainRegistration({
            sdkInstance: this,
            domain: normaliseDomain(domain),
            durationYears,
            rdt,
            userDetails,
            callbacks
        });

    }

    async activateDomain({ domain, rdt, userDetails, callbacks }: { domain: string; rdt: RadixDappToolkit; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return dispatchDomainActivation({
            sdkInstance: this,
            domain: normaliseDomain(domain),
            userDetails,
            rdt,
            callbacks
        });

    }

    async getUserBadge(accountAddress: string): Promise<UserBadgeResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return getUserBadgeId({
            sdkInstance: this,
            accountAddress
        });

    }

    async issueUserBadge({ rdt, userDetails, callbacks }: { rdt: RadixDappToolkit; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        return dispatchUserBadgeIssuance({
            sdkInstance: this,
            rdt,
            userDetails,
            callbacks
        });

    }

    async createRecord({ rdt, domain, userDetails, docket, callbacks }: { rdt: RadixDappToolkit; domain: string; userDetails: UserSpecificsI; docket: DocketI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        this.checkInitialized();
        await this.fetchDependencies();

        const domainData = await this.getDomainDetails(domain);

        if ('errors' in domainData)
            return domainData;

        return dispatchRecordCreation({
            sdkInstance: this,
            rdt,
            userDetails,
            rootDomainId: domainData.id,
            docket,
            callbacks
        });

    }

    private async dAppEntities(): Promise<EntitiesT> {

        try {

            if (!this.entities) {

                const expandedComponents = await expandComponents(config[this.network].components, this.state);
                this.entities = { ...config[this.network], components: expandedComponents }

            }


            return this.entities;

        } catch (error) {

            throw new Error(`RNS SDK: Could not fetch RNS entities: ${error}`);

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

            throw new Error(`RNS SDK: Could not fetch RNS dependencies: ${error}`);

        }

    }

}