import { StateKeyValueStoreDataResponse, StateNonFungibleDetailsResponseItem } from "@radixdlt/babylon-gateway-api-sdk";

import { DomainStatus } from "../mappings/status";
import { InstancePropsI } from "../common/types";

export interface DomainPropertiesI {

    status: DomainStatus;
    settlement?: {
        id: string;
        endTimestamp: number;
    };
    auction?: {
        id: string;
        currentBid: string;
        initialBid: string;
        leaderBadgeId: string;
        originatorId: string;
        endTimestamp: number;
    };

}

type AuctionIdT = string | null;

export async function domainToNonFungId(name: string) {

    const encoder = new TextEncoder();
    const data = encoder.encode(name);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const truncatedHashBuffer = hashBuffer.slice(0, 16);

    const hexString = Array.from(new Uint8Array(truncatedHashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .reverse()
        .join('');

    return `${hexString}`;

}

export async function determineStatus(settlementStore: StateKeyValueStoreDataResponse, instance: InstancePropsI): Promise<DomainPropertiesI> {

    const settlementExpiry = parseSettlementExpiry(settlementStore);
    const auctionId = parseAuctionId(settlementStore);

    if (isClaimed(settlementExpiry)) {

        return {
            status: DomainStatus.Claimed
        };

    }

    if (isInSettlement(settlementExpiry, auctionId)) {

        return {
            status: DomainStatus.InSettlement,
            settlement: {
                id: 'n/a',
                endTimestamp: settlementExpiry
            }
        };

    }

    if (isInAuction(settlementExpiry, auctionId)) {

        return await getAuctionStatus(auctionId, instance);

    }

    return {
        status: DomainStatus.Unclaimed
    };

}

function isClaimed(settlementExpiry: number) {

    return settlementExpiry && new Date().getTime() >= settlementExpiry;

}

function isInSettlement(settlementExpiry: number, auctionId: AuctionIdT) {

    return settlementExpiry && !auctionId;

}

function isInAuction(settlementExpiry: number, auctionId: AuctionIdT) {

    return settlementExpiry && auctionId;

}

function auctionHasEnded(endTimestamp: number) {

    return new Date().getTime() >= endTimestamp;

}

export async function getAuctionStatus(auctionId: string, instance: InstancePropsI) {

    return parseAuction(await instance.state.getNonFungibleData(instance.entities.rnsAuctionNftResource, auctionId));

}

function parseSettlementExpiry(settlementStore: StateKeyValueStoreDataResponse) {

    return settlementStore.entries.map(kv => {
        if (kv.value.programmatic_json.kind === 'Tuple') {
            if (kv.value.programmatic_json.fields[1].kind === 'I64') {
                return +kv.value.programmatic_json.fields[1].value * 1000
            }
        }

        return null;

    })[0];

}

function parseAuctionId(settlementStore: StateKeyValueStoreDataResponse) {

    return settlementStore.entries.map(kv => {
        if (kv.value.programmatic_json.kind === 'Tuple') {
            if (kv.value.programmatic_json.fields[3].kind === 'Enum'
                && kv.value.programmatic_json.fields[3].variant_name === 'Some'
                && kv.value.programmatic_json.fields[3].fields[0].kind === 'NonFungibleLocalId'
            ) {
                return kv.value.programmatic_json.fields[3].fields[0].value;
            }
        }

        return null;

    })[0];

}

function parseAuction(auction: StateNonFungibleDetailsResponseItem) {

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

        if (auctionHasEnded(auctionData.end_timestamp)) {
            return {
                status: DomainStatus.Claimed
            };
        }

        return {
            status: DomainStatus.InAuction,
            auction: {
                id: auction.non_fungible_id,
                currentBid: auctionData.bid_amount,
                initialBid: auctionData.initial_bid_amount,
                leaderBadgeId: auctionData.highest_bidder,
                originatorId: auctionData.original_buyer,
                endTimestamp: auctionData.end_timestamp
            }
        };

    }

}