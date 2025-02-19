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
import errors from './mappings/errors';

import { expandComponents } from './utils/entity.utils';
import { getBasePath } from './utils/gateway.utils';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';
import { dataResponse, errorStack, successResponse } from './utils/response.utils';
import { ProcessParameters, requireDependencies } from './decorators/sdk.decorators';

import { UserSpecificsI } from './common/user.types';
import { EventCallbacksI } from './common/transaction.types';
import { DocketPropsI, RecordItemI } from './common/record.types';
import { DependenciesI } from './common/dependencies.types';
import { DomainDataI } from './common/domain.types';
import { DocketI } from './common/record.types';
import { CommitmentStackResponseI, CheckAuthenticityResponseT, DomainAttributesResponseT, ErrorStackResponseI, RecordListResponseT, ResolvedRecordResponseI, UserBadgeResponseT, DomainListResponseT, DomainDetailsResponseT } from './common/response.types';
import { EntitiesT, ProofsI } from './common/entities.types';
import { NetworkT } from './common/gateway.types';
import { parameterProcessMap } from './mappings/sdk-processors';



export {
    RnsSDKConfigI,
    DomainAttributesResponseT,
    DomainDetailsResponseT,
    RecordItemI,
    DomainDataI,
    CheckAuthenticityResponseT,
    ResolvedRecordResponseI,
    UserBadgeResponseT,
    ProofsI,
    CommitmentStackResponseI,
    ErrorStackResponseI
};

interface RnsSDKConfigI {

    gateway?: GatewayApiClient;
    rdt?: RadixDappToolkit;
    network?: NetworkT;

}

@ProcessParameters(parameterProcessMap)
export default class RnsSDK {

    network: NetworkT;
    rdt: RadixDappToolkit;
    state: State;
    transaction: Transaction;
    status: Status;
    stream: Stream;
    entities: EntitiesT;
    dependencies: DependenciesI;

    constructor({ gateway, rdt, network = 'mainnet' }: RnsSDKConfigI) {

        this.network = network;
        this.rdt = rdt;
        this.initGateway({ gateway });
        this.fetchDependencies();

    }

    private async fetchDependencies(): Promise<void> {

        await this.dAppEntities();
        await this.dAppDependencies();

    }

    private initGateway({ gateway, gatewayEndpoint }: { gateway?: GatewayApiClient; gatewayEndpoint?: string; }): void {

        const gatewayInstance = gateway ?? GatewayApiClient.initialize({
            basePath: gatewayEndpoint ?? getBasePath(this.network),
            applicationName: 'The Radix Name Service'
        });

        const { status, state, transaction, stream } = gatewayInstance;

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
    async getDomainAttributes({ domain }: { domain: string }): Promise<DomainAttributesResponseT | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorStack(errors.domain.invalid({ domain, verbose: domainValidation.message }));

        const fetchAttributes = await requestDomainStatus(normalisedDomain, { sdkInstance: this });

        if (fetchAttributes instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: fetchAttributes.message }));

        return dataResponse({ ...fetchAttributes });

    }

    @requireDependencies('read-only')
    async getDomainDetails({ domain }: { domain: string }): Promise<DomainDetailsResponseT | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorStack(errors.domain.invalid({ domain, verbose: domainValidation.message }));

        const fetchDetails = await requestDomainDetails(normalisedDomain, { sdkInstance: this });

        if (fetchDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: fetchDetails.message }));

        if (!fetchDetails)
            return errorStack(errors.domain.empty({ domain }));

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: fetchDetails.address
        });

        if (!isAuthentic)
            return errorStack(errors.account.authenticityMismatch({ domain }));

        return dataResponse({ details: fetchDetails });

    }

    @requireDependencies('read-only')
    async getRecords({ domain }: { domain: string }): Promise<RecordListResponseT | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorStack(errors.domain.invalid({ domain, verbose: domainValidation.message }));

        const details = await requestDomainDetails(normalisedDomain, { sdkInstance: this });

        if (details instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: details.message }));

        if (!details)
            return errorStack(errors.domain.empty({ domain }));

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorStack(errors.account.authenticityMismatch({ domain }));

        const fetchRecords = await requestRecords(normalisedDomain, { sdkInstance: this });

        if (fetchRecords instanceof Error)
            return errorStack(errors.record.retrieval({ domain, verbose: fetchRecords.message }));

        return dataResponse({ records: fetchRecords });

    }

    @requireDependencies('read-only')
    async resolveRecord({ domain, docket, proven }: { domain: string; docket: DocketPropsI; proven?: boolean; }): Promise<ResolvedRecordResponseI | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const domainValidation = validateDomainEntity(normalisedDomain);

        if (!domainValidation.valid)
            return errorStack(errors.domain.invalid({ domain, verbose: domainValidation.message }));

        const fetchDetails = await requestDomainDetails(normalisedDomain, { sdkInstance: this });
        if (fetchDetails instanceof Error)
            return errorStack(errors.account.authenticityMismatch({ domain, verbose: fetchDetails.message }));

        const isAuthentic = await this.checkAuthenticity({
            domain: normalisedDomain,
            accountAddress: fetchDetails.address
        });

        if (!isAuthentic)
            return errorStack(errors.account.authenticityMismatch({ domain }));

        const fetchRecord = await resolveRecord(normalisedDomain, { context: docket.context, directive: docket.directive, proven }, { sdkInstance: this });
        if (fetchRecord instanceof Error)
            return errorStack(errors.record.retrieval({ domain, verbose: fetchRecord.message }));

        return dataResponse({ ...fetchRecord });

    }

    @requireDependencies('read-only')
    async getAccountDomains({ accountAddress }: { accountAddress: string }): Promise<DomainListResponseT | ErrorStackResponseI> {

        const fetchAccountDomains = await requestAccountDomains(accountAddress, { sdkInstance: this });

        if (fetchAccountDomains instanceof Error)
            return errorStack(errors.account.retrieval({ accountAddress, verbose: fetchAccountDomains.message }));

        return dataResponse({ domains: fetchAccountDomains });

    }

    @requireDependencies('read-only')
    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<CheckAuthenticityResponseT | ErrorStackResponseI> {

        const fetchInterests = await this.getAccountDomains({ accountAddress });

        if (fetchInterests instanceof Error)
            return errorStack(errors.account.retrieval({ accountAddress, verbose: fetchInterests.message }));

        if ('errors' in fetchInterests)
            return fetchInterests;

        const isAuthentic = fetchInterests.data.domains?.find((interestDomain: DomainDataI) => interestDomain.name === domain)?.address === accountAddress;

        return dataResponse({ isAuthentic });

    }

    @requireDependencies('full')
    async registerDomain({ domain, durationYears = 1, userDetails, callbacks }: { domain: string; durationYears?: number; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

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
    async activateDomain({ domain, userDetails, callbacks }: { domain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        return dispatchDomainActivation({
            sdkInstance: this,
            domain: normaliseDomain(domain),
            userDetails,
            rdt: this.rdt,
            callbacks
        });

    }

    @requireDependencies('full')
    async createSubdomain({ subdomain, userDetails, callbacks }: { subdomain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        return dispatchSubdomainCreation({
            sdkInstance: this,
            subdomain: normaliseDomain(subdomain),
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteSubdomain({ subdomain, userDetails, callbacks }: { subdomain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        return dispatchSubdomainDeletion({
            sdkInstance: this,
            subdomain: normaliseDomain(subdomain),
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('read-only')
    async getUserBadge({ accountAddress }: { accountAddress: string }): Promise<UserBadgeResponseT | ErrorStackResponseI> {

        return getUserBadgeId({
            sdkInstance: this,
            accountAddress
        });

    }

    @requireDependencies('full')
    async issueUserBadge({ userDetails, callbacks }: { userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        return dispatchUserBadgeIssuance({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async createRecord({ domain, userDetails, docket, proofs, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const fetchDetails = await this.getDomainDetails({ domain: normalisedDomain });
        if (fetchDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: fetchDetails.message }));

        if ('errors' in fetchDetails)
            return fetchDetails;

        return dispatchRecordCreation({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails: fetchDetails.data.details,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async amendRecord({ domain, userDetails, docket, proofs, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const fetchDetails = await this.getDomainDetails({ domain: normalisedDomain });
        if (fetchDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: fetchDetails.message }));

        if ('errors' in fetchDetails)
            return fetchDetails;

        return dispatchRecordAmendment({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails: fetchDetails.data.details,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteRecord({ domain, userDetails, docket, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketPropsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const normalisedDomain = normaliseDomain(domain);
        const fetchDetails = await this.getDomainDetails({ domain: normalisedDomain });
        if (fetchDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: fetchDetails.message }));

        if ('errors' in fetchDetails)
            return fetchDetails;

        return dispatchRecordDeletion({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails: fetchDetails.data.details,
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