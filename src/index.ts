import { GatewayApiClient, GatewayStatusResponse, State, Status, Stream, Transaction } from '@radixdlt/babylon-gateway-api-sdk';
import { NetworkT, getBasePath } from './utils/gateway.utils';
import entityConfig from './entities.config';
import { parseEntityDetails } from './utils/entity.utils';
import { DomainAttributesResponse, requestDomainStatus } from './requests/domain/status';
import { ResolvedRecordResponse, requestRecords, resolveRecord } from './requests/domain/records';
import { DomainDetailsResponse, DomainData, requestAccountDomains, requestDomainDetails, CheckAuthenticityResponse } from './requests/address/domains';
import { requestAuctionDetails, requestAuctions, requestBidsForAuction } from './requests/domain/auctions';
import { normaliseDomain, validateDomainEntity } from './utils/domain.utils';
import { RecordItem } from './mappings/records';
import { AllAuctionsResponse, AuctionBidResponse, AuctionDetailsResponse } from './common/auction.types';
import { AddressMapT } from './mappings/entities';
import { DependenciesI } from './common/dependencies.types';
import { requestXRDExchangeRate } from './requests/pricing/rates';

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
        this.resolveDependencies();

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

    async resolveDependencies(): Promise<void> {

        this.dependencies = {
            rates: {
                usdXrd: await requestXRDExchangeRate({ state: this.state, status: this.status, entities: this.entities })
            }
        };

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

        return await requestDomainStatus(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies });

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

        const details = await requestDomainDetails(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies });

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

        return await requestRecords(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies });

    }

    async resolveRecord({ domain, context, directive, proven }: { domain: string; context?: string; directive?: string; proven?: boolean }): Promise<ResolvedRecordResponse> {

        const normalisedDomain = normaliseDomain(domain);

        return await resolveRecord(normalisedDomain, { context, directive, proven }, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies });

    }

    async getAccountDomains(accountAddress: string): Promise<DomainData[]> {

        return await requestAccountDomains(accountAddress, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies });

    }

    async getAuction(domain: string): Promise<AuctionDetailsResponse> {

        const normalisedDomain = normaliseDomain(domain);

        return await requestAuctionDetails(normalisedDomain, { state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies });

    }

    async getAllAuctions(nextCursor?: string): Promise<AllAuctionsResponse> {

        return await requestAuctions({ state: this.state, status: this.status, entities: await this.dAppEntities(), dependencies: this.dependencies }, nextCursor);

    }

    async getBidsForAuction(auctionId: string, nextCursor?: string): Promise<AuctionBidResponse> {

        return await requestBidsForAuction(auctionId, nextCursor, { state: this.state, status: this.status, stream: this.stream, entities: await this.dAppEntities(), dependencies: this.dependencies });

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

    // async getDomainPrice(domain: string) {

    //     const usdExchangeRate = await getXRDExchangeRate({ state: this.state, status: this.status, tokenUsdPriceKvStore: (await this.dAppEntities()).tokenUsdPriceKvStore });
    //     return usdExchangeRate;


    // }

    private async dAppEntities(): Promise<AddressMapT> {

        try {

            if (!this.entities) {
                this.entities = await parseEntityDetails(await this.state.getEntityDetailsVaultAggregated(entityConfig[this.network].entities, { explicitMetadata: ['name'] }), this.state);
            }

            return this.entities;

        } catch (e) {
            console.log(e);
            return null;
        }

    }

}
