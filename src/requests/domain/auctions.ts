import { ProgrammaticScryptoSborValueI64, ProgrammaticScryptoSborValueTuple } from "@radixdlt/babylon-gateway-api-sdk";
import { Convert } from "@radixdlt/radix-engine-toolkit";

import { stringToUint } from "../../utils/string.utils";
import { domainToNonFungId } from "../../utils/domain.utils";
import { formatAuction } from "../../utils/auction.utils";

import { InstancePropsI } from "../../common/entities.types";
import { BidEvent, FormattedAuctionResultI, RawAuctionResultI } from "../../common/auction.types";
import { AllAuctionsResponse, AuctionBidResponse, AuctionDetailsResponse } from "../../common/response.types";

export async function requestAuctionDetails(domain: string, { sdkInstance }: InstancePropsI): Promise<AuctionDetailsResponse> {

    if (!sdkInstance.dependencies.rates.usdXrd) return null;

    try {

        const domainId = await domainToNonFungId(domain, false);

        const latestAuctionId = +((await sdkInstance.state.innerClient.keyValueStoreData({
            stateKeyValueStoreDataRequest: {
                key_value_store_address: sdkInstance.entities.components.auctionStorage.latestAuctionId,
                keys: [{ key_json: { kind: 'NonFungibleLocalId', value: `[${domainId}]` } }]
            }
        })).entries[0]?.value.programmatic_json as ProgrammaticScryptoSborValueI64)?.value;

        if (isNaN(latestAuctionId)) {
            return null;
        }

        const auctionIds = Array(latestAuctionId + 1).fill(0).map((_, i) => {
            return `[${Convert.Uint8Array.toHexString(
                new Uint8Array([
                    ...Convert.HexString.toUint8Array(domainId),
                    ...stringToUint(`${i}`),
                ]),
            )}]`;
        });

        const auctionNfts = await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.auctions, auctionIds);

        const auctionMap = auctionNfts.map((auction) => {
            if (auction.data?.programmatic_json.kind === 'Tuple') {
                return auction.data.programmatic_json.fields.reduce((acc, field) => {
                    if (field.field_name === 'end_timestamp' && field.kind === 'I64') {
                        return { ...acc, [field.field_name]: +field.value * 1000 };
                    }

                    if (field.kind === 'I64' || field.kind === 'Decimal' || field.kind === 'NonFungibleLocalId') {
                        if (field.field_name) {
                            return { ...acc, [field.field_name]: field.value };
                        }
                    }

                    if (field.kind === 'String') {
                        return { ...acc, [field.field_name]: field.value };
                    }

                    return acc;
                }, { id: auction.non_fungible_id } as RawAuctionResultI);
            }
        });

        const auction = auctionMap[auctionMap.length - 1] as RawAuctionResultI;
        if (!auction) return null;

        return formatAuction(auction, sdkInstance.dependencies.rates.usdXrd);

    } catch (e) {

        console.log(e);
        return null;

    }

}

export async function requestAuctions({ sdkInstance }: InstancePropsI, nextCursor: string): Promise<AllAuctionsResponse> {

    if (!sdkInstance.dependencies.rates.usdXrd) return null;

    const ledgerState = nextCursor ? await sdkInstance.status.getCurrent() : undefined;

    const auctionIds = await sdkInstance.state.innerClient.nonFungibleIds({
        stateNonFungibleIdsRequest: {
            resource_address: sdkInstance.entities.resources.collections.auctions,
            cursor: nextCursor,
            ...(ledgerState && { at_ledger_state: { state_version: ledgerState.ledger_state.state_version } })
        },
    });

    const auctionNfts = await sdkInstance.state.getNonFungibleData(sdkInstance.entities.resources.collections.auctions, auctionIds.non_fungible_ids.items);

    const data: FormattedAuctionResultI[] = auctionNfts.map((auction) => {
        if (auction.data?.programmatic_json.kind === 'Tuple') {

            const rawAuction = auction.data.programmatic_json.fields.reduce((acc, field) => {
                if (field.field_name === 'end_timestamp' && field.kind === 'I64') {
                    return { ...acc, [field.field_name]: +field.value * 1000 };
                }

                if (field.kind === 'I64' || field.kind === 'Decimal' || field.kind === 'NonFungibleLocalId') {
                    if (field.field_name) {
                        return { ...acc, [field.field_name]: field.value };
                    }
                }

                if (field.kind === 'String') {
                    return { ...acc, [field.field_name]: field.value };
                }

                return acc;
            }, { id: auction.non_fungible_id } as RawAuctionResultI);

            return formatAuction(rawAuction, sdkInstance.dependencies.rates.usdXrd);

        }
    });

    return { data, next_cursor: auctionIds?.non_fungible_ids?.next_cursor ?? null, total_count: auctionIds?.non_fungible_ids?.total_count ?? 0 };
}

export async function requestBidsForAuction(
    auctionId: string,
    nextCursor: string | undefined,
    { sdkInstance }: InstancePropsI): Promise<AuctionBidResponse> {
    const ledgerState = nextCursor ? await sdkInstance.status.getCurrent() : undefined;

    return sdkInstance.stream.innerClient.streamTransactions({
        streamTransactionsRequest: {
            affected_global_entities_filter: [sdkInstance.entities.components.auctionStorage.rootAddr, sdkInstance.entities.resources.collections.auctions],
            opt_ins: {
                receipt_events: true
            },
            cursor: nextCursor,
            ...(ledgerState && { at_ledger_state: { state_version: ledgerState.ledger_state.state_version } }),
        }
    }).then(r => {
        const data = r.items
            .map(i => i.receipt?.events?.filter(e => e.name === 'BidEvent').map(d => (d.data as ProgrammaticScryptoSborValueTuple).fields)[0])
            .map((bids) => {
                return (bids ?? []).reduce((acc, field) => {
                    if (field.field_name && 'value' in field) {
                        return { ...acc, [field.field_name]: field.value };
                    }

                    return acc;
                }, {} as BidEvent)
            })
            .filter(b => b.auction_id === auctionId);

        return { data, next_cursor: r.next_cursor, total_count: r.items.length };
    });
}
