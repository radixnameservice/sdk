import { GatewayApiClient, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';

import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { requestAccountDomains, requestDomainDetails } from './requests/address/domains';
import { requestXRDExchangeRate } from './requests/pricing/rates';
import { getUserBadgeId } from './requests/user/badges';
import { dispatchDomainRegistration } from './dispatchers/domain/registration';
import { dispatchUserBadgeIssuance } from './dispatchers/user/badge-management';
import { dispatchRecordCreation } from './dispatchers/record/creation';
import { dispatchRecordDeletion } from './dispatchers/record/deletion';
import { dispatchRecordAmendment } from './dispatchers/record/amendment';
import { dispatchDomainActivation } from './dispatchers/domain/activation';
import { dispatchSubdomainCreation } from './dispatchers/domain/subdomain-creation';
import { dispatchSubdomainDeletion } from './dispatchers/domain/subdomain-deletion';

import config from './entities.config';
import { commonErrors } from './common/errors';

import { expandComponents } from './utils/entity.utils';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';
import { errorResponse } from './utils/response.utils';
import { requireDependencies } from './decorators/sdk.decorators';

import { UserSpecificsI } from './common/user.types';
import { EventCallbacksI } from './common/transaction.types';
import { DocketPropsI, RecordItem } from './common/record.types';
import { DependenciesI } from './common/dependencies.types';
import { DomainData } from './common/domain.types';
import { DocketI } from './common/record.types';
import { AccountDomainsResponse, AllAuctionsResponse, AuctionBidResponse, AuctionDetailsResponse, CheckAuthenticityResponse, CommitmentStackResponse, DomainAttributesResponse, ErrorStackResponse, ResolvedRecordResponse, UserBadgeResponse } from './common/response.types';
import { EntitiesT, ProofsI } from './common/entities.types';


export {
    RnsSDKI,
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
    rdt?: RadixDappToolkit;
    network?: NetworkT;

}

export default class RnsSDK {

    network: NetworkT;
    rdt: RadixDappToolkit;
    state: State;
    transaction: Transaction;
    status: Status;
    stream: Stream;
    entities: EntitiesT;
    dependencies: DependenciesI;

    constructor({ gateway, rdt, network = 'mainnet' }: RnsSDKI) {

        this.network = network;
        this.rdt = rdt;
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

    @requireDependencies('read-only')
    async getDomainAttributes(domain: string): Promise<DomainAttributesResponse | ErrorStackResponse> {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorResponse(commonErrors.invalidDomain({ domain, verbose: domainValidation.message }));

        return requestDomainStatus(normalisedDomain, { sdkInstance: this });

    }

    @requireDependencies('read-only')
    async getDomainDetails(domain: string): Promise<DomainData | ErrorStackResponse> {

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

    @requireDependencies('read-only')
    async getRecords(domain: string): Promise<RecordItem[] | ErrorStackResponse> {

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

    @requireDependencies('read-only')
    async resolveRecord({ domain, docket, proven }: { domain: string; docket: DocketPropsI; proven?: boolean; }): Promise<ResolvedRecordResponse | ErrorStackResponse> {

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

        return resolveRecord(normalisedDomain, { context: docket.context, directive: docket.directive, proven }, { sdkInstance: this });

    }

    @requireDependencies('read-only')
    async getAccountDomains(accountAddress: string): Promise<AccountDomainsResponse | ErrorStackResponse> {

        const accountDomains = requestAccountDomains(accountAddress, { sdkInstance: this });

        if (!accountDomains)
            return errorResponse(commonErrors.accountRetrieval({ accountAddress, verbose: `An error occured when requesting user account domains from: ${accountAddress}.` }));

        return accountDomains;

    }

    @requireDependencies('read-only')
    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<CheckAuthenticityResponse | ErrorStackResponse> {

        const domainInterests = await this.getAccountDomains(accountAddress);

        if ('errors' in domainInterests)
            return domainInterests;

        const isAuthentic = domainInterests.find((interestDomain) => interestDomain.name === domain)?.address === accountAddress;

        return {
            isAuthentic
        };

    }

    @requireDependencies('full')
    async registerDomain({ domain, durationYears = 1, userDetails, callbacks }: { domain: string; durationYears?: number; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        return dispatchDomainRegistration({
            sdkInstance: this,
            domain: normaliseDomain(domain),
            durationYears,
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async activateDomain({ domain, userDetails, callbacks }: { domain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        return dispatchDomainActivation({
            sdkInstance: this,
            domain: normaliseDomain(domain),
            userDetails,
            rdt: this.rdt,
            callbacks
        });

    }

    @requireDependencies('full')
    async createSubdomain({ subdomain, userDetails, callbacks }: { subdomain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        return dispatchSubdomainCreation({
            sdkInstance: this,
            subdomain: normaliseDomain(subdomain),
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteSubdomain({ subdomain, userDetails, callbacks }: { subdomain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        return dispatchSubdomainDeletion({
            sdkInstance: this,
            subdomain: normaliseDomain(subdomain),
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('read-only')
    async getUserBadge(accountAddress: string): Promise<UserBadgeResponse | ErrorStackResponse> {

        return getUserBadgeId({
            sdkInstance: this,
            accountAddress
        });

    }

    @requireDependencies('full')
    async issueUserBadge({ userDetails, callbacks }: { userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        return dispatchUserBadgeIssuance({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async createRecord({ domain, userDetails, docket, proofs, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        const normalisedDomain = normaliseDomain(domain);
        const domainData = await this.getDomainDetails(normalisedDomain);

        if ('errors' in domainData)
            return domainData;

        return dispatchRecordCreation({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            rootDomainId: domainData.id,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async amendRecord({ domain, userDetails, docket, proofs, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        const normalisedDomain = normaliseDomain(domain);
        const domainData = await this.getDomainDetails(normalisedDomain);

        if ('errors' in domainData)
            return domainData;

        return dispatchRecordAmendment({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails: domainData,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteRecord({ domain, userDetails, docket, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketPropsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponse | ErrorStackResponse> {

        const normalisedDomain = normaliseDomain(domain);
        const domainData = await this.getDomainDetails(normalisedDomain);

        if ('errors' in domainData)
            return domainData;

        return dispatchRecordDeletion({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails: domainData,
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