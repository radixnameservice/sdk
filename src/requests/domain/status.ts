import { ProgrammaticScryptoSborValueBool, ProgrammaticScryptoSborValueEnum } from "@radixdlt/babylon-gateway-api-sdk";

import { DomainStatus, mapStatusInt } from "../../mappings/status";
import { requestDomainDetails } from "../address/domains";

import { getBasePrice } from "../../utils/pricing.utils";
import { domainToNonFungId } from "../../utils/domain.utils";

import { InstancePropsI } from "../../common/entities.types";
import { DomainAttributesResponseT } from "../../common/response.types";


export async function requestDomainStatus(domainName: string, { sdkInstance }: InstancePropsI): Promise<DomainAttributesResponseT | Error> {

    try {

        if (!sdkInstance.dependencies.rates.usdXrd)
            throw new Error("RNS SDK: Price / rate based dependencies have not been resolved, but are required for this method.");

        const properties = await requestDomainProperties(domainName, { sdkInstance });

        if (properties instanceof Error)
            throw properties;

        const price = getBasePrice(domainName, sdkInstance.dependencies.rates.usdXrd);

        return {
            ...mapStatusInt(domainName, properties?.status),
            ...{ price }
        }

    } catch (e) {

        return e;

    }

}

const ClaimType = {
    Landrush: DomainStatus.Landrush,
    Sunrise: DomainStatus.Sunrise,
}

async function requestDomainProperties(domainName: string, { sdkInstance }: InstancePropsI) {

    try {

        const domainId = await domainToNonFungId(domainName);

        const settlementKvStoreResponse = await sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.domainStorage.settlementConfigStoreAddr,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: domainId } }]
            }
        });

        const domainClaimsResponse = await sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.domainStorage.domainEventClaimsStoreAddr,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: domainId } }]
            }
        });

        if (domainClaimsResponse.entries.length) {
            const value = domainClaimsResponse.entries[0].value.programmatic_json as ProgrammaticScryptoSborValueEnum;
            return { status: ClaimType[value.variant_name as keyof typeof ClaimType] };
        }

        const tldsResponse = await sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.domainStorage.domainTldConfigKVAddr,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: domainId } }]
            }
        });

        if (tldsResponse.entries.length) {
            const value = tldsResponse.entries[0].value.programmatic_json as ProgrammaticScryptoSborValueBool;

            if (!value.value) return { status: DomainStatus.Tld };
        }


        let auctionId = null;

        const settlementExpiry = settlementKvStoreResponse.entries.map(kv => {
            if (kv.value.programmatic_json.kind === 'Tuple') {
                if (kv.value.programmatic_json.fields[3].kind === 'Enum'
                    && kv.value.programmatic_json.fields[3].variant_name === 'Some'
                    && kv.value.programmatic_json.fields[3].fields[0].kind === 'NonFungibleLocalId'
                ) {
                    auctionId = kv.value.programmatic_json.fields[3].fields[0].value;
                }

                if (kv.value.programmatic_json.fields[1].kind === 'I64') {
                    return +kv.value.programmatic_json.fields[1].value * 1000
                }
            }
        })[0];

        if (auctionId) {
            const auction = await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.auctions, auctionId);

            if (auction.data?.programmatic_json.kind === 'Tuple') {
                const auctionData = auction.data.programmatic_json.fields.reduce((acc, field) => {

                    if (field.field_name === 'end_timestamp' && field.kind === 'I64') {
                        return { ...acc, [field.field_name]: +field.value * 1000 };
                    }

                    if (field.kind === 'I64' || field.kind === 'Decimal' || field.kind === 'NonFungibleLocalId') {
                        if (field.field_name) {
                            return { ...acc, [field.field_name]: field.value };
                        }
                    }

                    return acc;
                }, { id: auction.non_fungible_id } as { id: string, bid_amount: string; initial_bid_amount: string, highest_bidder: string, original_buyer: string, end_timestamp: number });

                if (new Date().getTime() >= auctionData.end_timestamp) {
                    return {
                        status: DomainStatus.Claimed
                    }
                } else {
                    return {
                        status: DomainStatus.InAuction,
                        auction: {
                            id: auction.non_fungible_id,
                            currentBid: auctionData.bid_amount,
                            initialBid: auctionData.initial_bid_amount,
                            leaderBadgeId: auctionData.highest_bidder,
                            originatorId: auctionData.original_buyer,
                            endTime: auctionData.end_timestamp
                        }
                    }
                }
            }
        } else if (settlementExpiry && new Date().getTime() >= settlementExpiry) {
            return {
                status: DomainStatus.Claimed
            }
        } else if (settlementExpiry && !auctionId) {

            return {
                status: DomainStatus.InSettlement,
                settlement: {
                    id: 'n/a',
                    endTime: settlementExpiry
                }
            }
        }

        const domain = await requestDomainDetails(domainName, { sdkInstance });
        if (domain instanceof Error)
            throw new Error(domain.message);

        if (domain) {
            return {
                status: DomainStatus.Claimed
            };
        }

        return {
            status: DomainStatus.Unclaimed
        }

    } catch (e) {

        console.log(e);
        return e;

    }

}
