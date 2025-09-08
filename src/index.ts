import { GatewayApiClient, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { RadixDappToolkit } from '@radixdlt/radix-dapp-toolkit';

import { requestDomainStatus } from './requests/domain/status';
import { requestRecords, resolveRecord } from './requests/domain/records';
import { requestAccountDomains, requestDomainDetails, requestDomainEntityDetails, getSubdomains } from './requests/address/domains';
import { requestXRDExchangeRate } from './requests/pricing/rates';
import { dispatchDomainRegistration } from './dispatchers/domain/registration';
import { dispatchRecordCreation } from './dispatchers/record/creation';
import { dispatchRecordDeletion, dispatchRecordDeletionById } from './dispatchers/record/deletion';
import { dispatchRecordAmendment } from './dispatchers/record/amendment';
import { dispatchDomainActivation } from './dispatchers/domain/activation';
import { dispatchSubdomainCreation } from './dispatchers/domain/subdomain-creation';
import { dispatchSubdomainDeletion } from './dispatchers/domain/subdomain-deletion';
import { dispatchDomainTransfer } from './dispatchers/domain/transfer';

import config from './entities.config';
import errors from './mappings/errors';
import { parameterProcessMap } from './mappings/sdk-processors';

import { expandComponents } from './utils/entity.utils';
import { getBasePath } from './utils/gateway.utils';
import { deriveDomainType, deriveRootDomain, validateDomain, validateSubdomain } from './utils/domain.utils';
import { generateAuthCheckProps, retrievalError, retrievalResponse, transactionError } from './utils/response.utils';
import { validateAccountAddress } from './utils/address.utils';
import { ProcessParameters, requireDependencies } from './decorators/sdk.decorators';

import { EventCallbacksI } from './common/transaction.types';
import { DocketPropsI, RecordItemI } from './common/record.types';
import { DependenciesI } from './common/dependencies.types';
import { DomainDataI, SubDomainDataI, PaginatedDomainsResponseI, PaginatedSubdomainsResponseI, DomainPaginationParamsI } from './common/domain.types';
import { RecordDocketI, ContextT } from './common/record.types';
import { CheckAuthenticityResponseT, DomainAttributesResponseT, SdkTransactionResponseT, RecordListResponseT, ResolvedRecordResponseT, ErrorI, SdkResponseT, TransactionFeedbackStackI, TransactionFeedbackI } from './common/response.types';
import { EntitiesT, ProofsI } from './common/entities.types';
import { NetworkT } from './common/gateway.types';
import { RegistrarDetailsI } from './common/registrar.types';
import { UtilValidationT } from './common/util.types';
import { RawPricePairI } from './common/pricing.types';
import { TransferPreferencesI } from './common/dispatcher.types';

export {
    RnsSDKConfigI,
    DomainAttributesResponseT,
    RecordListResponseT,
    RecordItemI,
    RecordDocketI,
    ContextT,
    DomainDataI,
    SubDomainDataI,
    PaginatedDomainsResponseI,
    PaginatedSubdomainsResponseI,
    DomainPaginationParamsI,
    CheckAuthenticityResponseT,
    ResolvedRecordResponseT,
    ProofsI,
    ErrorI,
    TransactionFeedbackStackI,
    TransactionFeedbackI,
    SdkResponseT,
    SdkTransactionResponseT,
    EventCallbacksI,
    RegistrarDetailsI,
    NetworkT,
    UtilValidationT,
    RawPricePairI,
    TransferPreferencesI
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
    async getDomainStatus({ domain }: { domain: string }): Promise<SdkResponseT<DomainAttributesResponseT>> {

        const attributes = await requestDomainStatus(domain, { sdkInstance: this });

        if (attributes instanceof Error)
            return retrievalError(errors.domain.generic({ domain, verbose: attributes.message }));

        return retrievalResponse(attributes);

    }

    @requireDependencies('read-only')
    async getDomainDetails({ domain }: { domain: string }): Promise<SdkResponseT<DomainDataI | SubDomainDataI>> {

        const details = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (details instanceof Error)
            return retrievalError(errors.domain.generic({ domain, verbose: details.message }));
        if (!details)
            return retrievalError(errors.domain.empty({ domain }));

        const authCheckProps = generateAuthCheckProps({ domain, details });
        const isAuthentic = await this.checkAuthenticity(authCheckProps);

        if (!isAuthentic)
            return retrievalError(errors.account.authenticityMismatch({ domain: authCheckProps.domain }));

        return retrievalResponse(details);

    }

    @requireDependencies('read-only')
    async getRecords({ domain }: { domain: string }): Promise<SdkResponseT<RecordListResponseT>> {

        const details = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (details instanceof Error)
            return retrievalError(errors.domain.generic({ domain, verbose: details.message }));
        if (!details)
            return retrievalError(errors.domain.empty({ domain }));

        const authCheckProps = generateAuthCheckProps({ domain, details });
        const isAuthentic = await this.checkAuthenticity(authCheckProps);

        if (!isAuthentic)
            return retrievalError(errors.account.authenticityMismatch({ domain: authCheckProps.domain }));

        const records = await requestRecords(domain, { sdkInstance: this });

        if (records instanceof Error)
            return retrievalError(errors.record.retrieval({ domain, verbose: records.message }));

        return retrievalResponse(records);

    }

    @requireDependencies('read-only')
    async resolveRecord({ domain, docket, proven }: { domain: string; docket: DocketPropsI; proven?: boolean; }): Promise<SdkResponseT<ResolvedRecordResponseT>> {

        const details = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (details instanceof Error)
            return retrievalError(errors.account.authenticityMismatch({ domain, verbose: details.message }));

        const authCheckProps = generateAuthCheckProps({ domain, details });
        const isAuthentic = await this.checkAuthenticity(authCheckProps);

        if (!isAuthentic)
            return retrievalError(errors.account.authenticityMismatch({ domain: authCheckProps.domain }));

        const record = await resolveRecord(domain, { context: docket.context, directive: docket.directive, proven }, { sdkInstance: this });

        if (record instanceof Error)
            return retrievalError(errors.record.retrieval({ domain, verbose: record.message }));

        return retrievalResponse(record);

    }

    @requireDependencies('read-only')
    async getAccountDomains({ accountAddress, pagination }: { accountAddress: string; pagination?: DomainPaginationParamsI }): Promise<SdkResponseT<PaginatedDomainsResponseI>> {

        const accountDomains = await requestAccountDomains(accountAddress, { sdkInstance: this }, pagination);

        if (accountDomains instanceof Error)
            return retrievalError(errors.account.retrieval({ accountAddress, verbose: accountDomains.message }));

        return retrievalResponse(accountDomains);

    }

    @requireDependencies('read-only')
    async checkAuthenticity({ domain, accountAddress }: { domain: string; accountAddress: string }): Promise<SdkResponseT<CheckAuthenticityResponseT>> {

        const accountDomainsResponse = await requestAccountDomains(accountAddress, { sdkInstance: this });

        if (accountDomainsResponse instanceof Error)
            return retrievalError(errors.account.retrieval({ accountAddress, verbose: accountDomainsResponse.message }));

        const isAuthentic = accountDomainsResponse.domains?.find((interestDomain: DomainDataI) => interestDomain.name === domain)?.address === accountAddress;

        return retrievalResponse({ isAuthentic });

    }

    @requireDependencies('read-only')
    async getSubdomains({ rootDomainId, pagination }: { rootDomainId: string; pagination?: DomainPaginationParamsI }): Promise<SdkResponseT<PaginatedSubdomainsResponseI>> {

        const subdomains = await getSubdomains(rootDomainId, { sdkInstance: this }, pagination);

        if (subdomains instanceof Error)
            return retrievalError(errors.domain.generic({ domain: rootDomainId, verbose: subdomains.message }));

        return retrievalResponse(subdomains);

    }

    @requireDependencies('full')
    async registerDomain({ domain, durationYears = 1, accountAddress, registrarDetails, callbacks }: { domain: string; durationYears?: number; accountAddress: string; registrarDetails?: RegistrarDetailsI; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const attributes = await requestDomainStatus(domain, { sdkInstance: this });

        if (attributes instanceof Error)
            return transactionError(errors.registration.generic({ domain, verbose: attributes.message }));
        if (attributes.status !== 'available')
            return transactionError(errors.domain.unavailable({ domain }));

        return dispatchDomainRegistration({
            sdkInstance: this,
            domain,
            durationYears,
            rdt: this.rdt,
            accountAddress,
            callbacks
        });

    }

    @requireDependencies('full')
    async activateDomain({ domain, accountAddress, callbacks }: { domain: string; accountAddress: string; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const domainDetails = await requestDomainDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return transactionError(errors.domain.empty({ domain }));

        return dispatchDomainActivation({
            sdkInstance: this,
            domainDetails,
            accountAddress,
            rdt: this.rdt,
            callbacks
        });

    }

    @requireDependencies('full')
    async createSubdomain({ subdomain, accountAddress, callbacks }: { subdomain: string; accountAddress: string; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const rootDomainDetails = await requestDomainDetails(deriveRootDomain(subdomain), { sdkInstance: this });

        if (rootDomainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain: rootDomainDetails.name, verbose: rootDomainDetails.message }));
        if (!rootDomainDetails)
            return transactionError(errors.domain.empty({ domain: rootDomainDetails.name }));

        return dispatchSubdomainCreation({
            sdkInstance: this,
            subdomain,
            rootDomainDetails,
            rdt: this.rdt,
            accountAddress,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteSubdomain({ subdomain, accountAddress, callbacks }: { subdomain: string; accountAddress: string; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const rootDomainDetails = await requestDomainDetails(deriveRootDomain(subdomain), { sdkInstance: this });

        if (rootDomainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain: rootDomainDetails.name, verbose: rootDomainDetails.message }));
        if (!rootDomainDetails)
            return transactionError(errors.domain.empty({ domain: rootDomainDetails.name }));

        return dispatchSubdomainDeletion({
            sdkInstance: this,
            subdomain,
            rootDomainDetails,
            rdt: this.rdt,
            accountAddress,
            callbacks
        });

    }

    @requireDependencies('full')
    async createRecord({ domain, accountAddress, docket, proofs, callbacks }: { domain: string; accountAddress: string; docket: RecordDocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        if (docket.proven && !proofs?.fungibles && !proofs?.nonFungibles)
            return transactionError(errors.record.creation({ docket, verbose: 'Docket is specified as "proven", however, no "proofs" value is specified.' }));
        if (!docket.proven && (proofs?.fungibles || proofs?.nonFungibles))
            return transactionError(errors.record.creation({ docket, verbose: 'Docket is specified as NOT "proven", however, a "proofs" value is specified.' }));

        const domainDetails = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return transactionError(errors.domain.empty({ domain }));

        return dispatchRecordCreation({
            sdkInstance: this,
            rdt: this.rdt,
            accountAddress,
            domainDetails,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async amendRecord({ domain, accountAddress, docket, proofs, callbacks }: { domain: string; accountAddress: string; docket: RecordDocketI; proofs?: ProofsI; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        if (docket.proven && !proofs)
            return transactionError(errors.record.amendment({ docket, verbose: 'Docket is specified as "proven", however, no "proofs" value is specified.' }));
        if (!docket.proven && proofs)
            return transactionError(errors.record.amendment({ docket, verbose: 'Docket is specified as NOT "proven", however, a "proofs" value is specified.' }));

        const domainDetails = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return transactionError(errors.domain.empty({ domain }));

        return dispatchRecordAmendment({
            sdkInstance: this,
            rdt: this.rdt,
            accountAddress,
            domainDetails,
            docket,
            proofs,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteRecord({ domain, accountAddress, docket, callbacks }: { domain: string; accountAddress: string; docket: DocketPropsI; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const domainDetails = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return transactionError(errors.domain.empty({ domain }));

        return dispatchRecordDeletion({
            sdkInstance: this,
            rdt: this.rdt,
            accountAddress,
            domainDetails,
            docket,
            callbacks
        });

    }

    @requireDependencies('full')
    async deleteRecordById({ domain, accountAddress, recordId, callbacks }: { domain: string; accountAddress: string; recordId: string; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const domainDetails = await requestDomainEntityDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return transactionError(errors.domain.empty({ domain }));

        return dispatchRecordDeletionById({
            sdkInstance: this,
            rdt: this.rdt,
            accountAddress,
            domainDetails,
            recordId,
            callbacks
        });

    }

    @requireDependencies('full')
    async transferDomain({ domain, fromAddress, destinationAddress, preferences, callbacks }: { domain: string; fromAddress: string; destinationAddress: string; preferences?: TransferPreferencesI; callbacks?: EventCallbacksI }): Promise<SdkTransactionResponseT<TransactionFeedbackStackI>> {

        const domainDetails = await requestDomainDetails(domain, { sdkInstance: this });

        if (domainDetails instanceof Error)
            return transactionError(errors.domain.generic({ domain, verbose: domainDetails.message }));
        if (!domainDetails)
            return transactionError(errors.domain.empty({ domain }));

        return dispatchDomainTransfer({
            sdkInstance: this,
            rdt: this.rdt,
            domainDetails,
            fromAddress,
            destinationAddress,
            preferences,
            callbacks
        });

    }

    public utils = {

        validateDomain({ domain }: { domain: string }): UtilValidationT {

            const validate = validateDomain(domain);

            if (typeof validate !== 'boolean' && 'error' in validate) {

                return {
                    isValid: false,
                    errors: [validate]
                };

            }

            return {
                isValid: true
            };

        },

        validateSubdomain({ subdomain }: { subdomain: string }): UtilValidationT {

            const validate = validateSubdomain(subdomain);

            if (typeof validate !== 'boolean' && 'error' in validate) {

                return {
                    isValid: false,
                    errors: [validate]
                };

            }

            return {
                isValid: true
            };

        },

        validateAccountAddress({ accountAddress }: { accountAddress: string }): UtilValidationT {

            const validate = validateAccountAddress(accountAddress, { network: this.network });

            if (typeof validate !== 'boolean' && 'error' in validate) {

                return {
                    isValid: false,
                    errors: [validate]
                };

            }

            return {
                isValid: true
            };

        },

        getRootFromSubdomain({ subdomain }: { subdomain: string }): string | null {
            return deriveRootDomain(subdomain);
        },

        isSubdomain(domainEntity: string): boolean {

            const domainType = deriveDomainType(domainEntity);

            if (typeof domainType !== 'string' && 'error' in domainType) {
                return false
            }

            return deriveDomainType(domainEntity) === "sub" ? true : false;
        },

        isRootDomain(domainEntity: string): boolean {

            const domainType = deriveDomainType(domainEntity);

            if (typeof domainType !== 'string' && 'error' in domainType) {
                return false;
            }

            return deriveDomainType(domainEntity) === "root" ? true : false;
        }

    };

}

(async () => {

    const rns = new RnsSDK({
        network: 'mainnet'
    });

    // const attributes = await rns.getDomainAttributes('james2.xrd');
    // const records = await rns.getRecords('james2.xrd');

    // const resolvedRecord = await rns.resolveRecord({
    //     domain: 'test-records-present.xrd',
    //     context: 'funnels',
    //     directive: 'xrd'
    //  });

    // const auction = await rns.getAuction('nft.xrd');
    // console.log(auction);

    const ownerDomains = await rns.getAccountDomains({ accountAddress: 'account_rdx16yte04k8qwdw3l49humul5wpnesfyg2ws8nea8ezceuq90nr506au0', pagination: { page: 2 } });

    console.log(ownerDomains.data);

})();