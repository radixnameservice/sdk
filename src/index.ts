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
import { parameterProcessMap } from './mappings/sdk-processors';

import { expandComponents } from './utils/entity.utils';
import { getBasePath } from './utils/gateway.utils';
import { deriveRootDomain, validateDomain } from './utils/domain.utils';
import { dataResponse, errorStack } from './utils/response.utils';
import { ProcessParameters, requireDependencies } from './decorators/sdk.decorators';

import { UserSpecificsI } from './common/user.types';
import { EventCallbacksI } from './common/transaction.types';
import { DocketPropsI, RecordItemI } from './common/record.types';
import { DependenciesI } from './common/dependencies.types';
import { DomainDataI } from './common/domain.types';
import { DocketI } from './common/record.types';
import { CommitmentStackResponseI, CheckAuthenticityResponseT, DomainAttributesResponseT, ErrorStackResponseI, RecordListResponseT, ResolvedRecordResponseI, UserBadgeResponseT, DomainListResponseT, DomainDetailsResponseT, ErrorI } from './common/response.types';
import { EntitiesT, ProofsI } from './common/entities.types';
import { NetworkT } from './common/gateway.types';

export {
    RnsSDKConfigI,
    DomainAttributesResponseT,
    DomainDetailsResponseT,
    DomainListResponseT,
    RecordListResponseT,
    RecordItemI,
    DomainDataI,
    CheckAuthenticityResponseT,
    ResolvedRecordResponseI,
    UserBadgeResponseT,
    ProofsI,
    ErrorI,
    CommitmentStackResponseI,
    ErrorStackResponseI,
    EventCallbacksI
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

    private async dAppEntities(): Promise<EntitiesT> {

        try {

            if (!this.entities) {

                const expandedComponents = await expandComponents(config[this.network].components, this.state, this.network);
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

    @requireDependencies('read-only')
    async getDomainAttributes({ domain }: { domain: string }): Promise<DomainAttributesResponseT | ErrorStackResponseI> {

        const attributes = await requestDomainStatus(domain, { sdkInstance: this });

        if (attributes instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: attributes.message }));

        return dataResponse(attributes);

    }

    @requireDependencies('read-only')
    async getDomainDetails({ domain }: { domain: string }): Promise<DomainDetailsResponseT | ErrorStackResponseI> {

        const details = await requestDomainDetails(domain, { sdkInstance: this });

        if (details instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: details.message }));
        if (!details)
            return errorStack(errors.domain.empty({ domain }));

        const isAuthentic = await this.checkAuthenticity({
            domain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorStack(errors.account.authenticityMismatch({ domain }));

        return dataResponse(details);

    }

    @requireDependencies('read-only')
    async getRecords({ domain }: { domain: string }): Promise<RecordListResponseT | ErrorStackResponseI> {

        const details = await requestDomainDetails(domain, { sdkInstance: this });

        if (details instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: details.message }));
        if (!details)
            return errorStack(errors.domain.empty({ domain }));

        const isAuthentic = await this.checkAuthenticity({
            domain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorStack(errors.account.authenticityMismatch({ domain }));

        const records = await requestRecords(domain, { sdkInstance: this });

        if (records instanceof Error)
            return errorStack(errors.record.retrieval({ domain, verbose: records.message }));

        return dataResponse(records);

    }

    @requireDependencies('read-only')
    async resolveRecord({ domain, docket, proven }: { domain: string; docket: DocketPropsI; proven?: boolean; }): Promise<ResolvedRecordResponseI | ErrorStackResponseI> {

        const details = await requestDomainDetails(domain, { sdkInstance: this });

        if (details instanceof Error)
            return errorStack(errors.account.authenticityMismatch({ domain, verbose: details.message }));

        const isAuthentic = await this.checkAuthenticity({
            domain,
            accountAddress: details.address
        });

        if (!isAuthentic)
            return errorStack(errors.account.authenticityMismatch({ domain }));

        const record = await resolveRecord(domain, { context: docket.context, directive: docket.directive, proven }, { sdkInstance: this });

        if (record instanceof Error)
            return errorStack(errors.record.retrieval({ domain, verbose: record.message }));

        return dataResponse(record);

    }

    @requireDependencies('read-only')
    async getAccountDomains({ accountAddress }: { accountAddress: string }): Promise<DomainListResponseT | ErrorStackResponseI> {

        const accountDomains = await requestAccountDomains(accountAddress, { sdkInstance: this });

        if (accountDomains instanceof Error)
            return errorStack(errors.account.retrieval({ accountAddress, verbose: accountDomains.message }));

        return dataResponse(accountDomains);

    }

    @requireDependencies('read-only')
    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<CheckAuthenticityResponseT | ErrorStackResponseI> {

        const accountDomains = await requestAccountDomains(accountAddress, { sdkInstance: this });

        if (accountDomains instanceof Error)
            return errorStack(errors.account.retrieval({ accountAddress, verbose: accountDomains.message }));

        const isAuthentic = accountDomains?.find((interestDomain: DomainDataI) => interestDomain.name === domain)?.address === accountAddress;

        return dataResponse({ isAuthentic });

    }

    @requireDependencies('read-only')
    async getUserBadge({ accountAddress }: { accountAddress: string }): Promise<UserBadgeResponseT | ErrorStackResponseI> {

        return getUserBadgeId({
            sdkInstance: this,
            accountAddress
        });

    }

    @requireDependencies('full')
    async registerDomain({ domain, durationYears = 1, userDetails, callbacks }: { domain: string; durationYears?: number; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const attributes = await requestDomainStatus(domain, { sdkInstance: this });

        if (attributes instanceof Error)
            return errorStack(errors.registration.generic({ domain, verbose: attributes.message }));
        if (attributes.status !== 'available')
            return errorStack(errors.domain.unavailable({ domain }));

        return dispatchDomainRegistration({
            sdkInstance: this,
            domain,
            durationYears,
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async activateDomain({ domain, userDetails, callbacks }: { domain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const domainDetails = await requestDomainDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return errorStack(errors.domain.empty({ domain }));

        return dispatchDomainActivation({
            sdkInstance: this,
            domainDetails,
            userDetails,
            rdt: this.rdt,
            callbacks
        });

    }

    @requireDependencies('full')
    async createSubdomain({ subdomain, userDetails, callbacks }: { subdomain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const rootDomainDetails = await requestDomainDetails(deriveRootDomain(subdomain), { sdkInstance: this });

        if (rootDomainDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain: rootDomainDetails.name, verbose: rootDomainDetails.message }));
        if (!rootDomainDetails)
            return errorStack(errors.domain.empty({ domain: rootDomainDetails.name }));

        return dispatchSubdomainCreation({
            sdkInstance: this,
            subdomain,
            rootDomainDetails,
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteSubdomain({ subdomain, userDetails, callbacks }: { subdomain: string; userDetails: UserSpecificsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const rootDomainDetails = await requestDomainDetails(deriveRootDomain(subdomain), { sdkInstance: this });

        if (rootDomainDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain: rootDomainDetails.name, verbose: rootDomainDetails.message }));
        if (!rootDomainDetails)
            return errorStack(errors.domain.empty({ domain: rootDomainDetails.name }));

        return dispatchSubdomainDeletion({
            sdkInstance: this,
            subdomain,
            rootDomainDetails,
            rdt: this.rdt,
            userDetails,
            callbacks
        });

    }

    @requireDependencies('full')
    async issueUserBadge({ accountAddress, callbacks }: { accountAddress: string; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        return dispatchUserBadgeIssuance({
            sdkInstance: this,
            rdt: this.rdt,
            accountAddress,
            callbacks
        });

    }

    @requireDependencies('full')
    async createRecord({ domain, userDetails, docket, proofs, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const domainDetails = await requestDomainDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return errorStack(errors.domain.empty({ domain }));

        return dispatchRecordCreation({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async amendRecord({ domain, userDetails, docket, proofs, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const domainDetails = await requestDomainDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return errorStack(errors.domain.empty({ domain }));

        return dispatchRecordAmendment({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteRecord({ domain, userDetails, docket, callbacks }: { domain: string; userDetails: UserSpecificsI; docket: DocketPropsI; callbacks?: EventCallbacksI }): Promise<CommitmentStackResponseI | ErrorStackResponseI> {

        const domainDetails = await requestDomainDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return errorStack(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return errorStack(errors.domain.empty({ domain }));

        return dispatchRecordDeletion({
            sdkInstance: this,
            rdt: this.rdt,
            userDetails,
            domainDetails,
            docket,
            callbacks
        });

    }

    public utils = {

        validateDomain({ domain }: { domain: string }): true | ErrorI {
            return validateDomain(domain);
        }

    };

}